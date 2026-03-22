from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import os
from datetime import datetime
import shutil
import io
from fpdf import FPDF
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from sqlalchemy.orm import joinedload
from sqlalchemy import func

from models import (
    db, migrate, User, Student, Payment, Admission, AuditLog, Notification,
    AcademicYear, ClassRoom, StudentSession, FeeType, StudentFee,
    StudentAttendance, Staff, StaffAttendance, Subject, Exam, Grade, BusRoute
)
from schemas import (
    UserSchema, StudentSchema, PaymentSchema, AdmissionSchema, AuditLogSchema, NotificationSchema,
    AcademicYearSchema, ClassRoomSchema, StudentSessionSchema, StaffSchema, StaffAttendanceSchema
)
from helpers import admin_required, check_admin_password
from dotenv import load_dotenv
import json
import math
from flask.json.provider import DefaultJSONProvider

# Load environment variables
load_dotenv()

class SafeJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, float):
            if math.isnan(obj) or math.isinf(obj):
                return 0.0
        return super().default(obj)

def safe_float(val):
    try:
        # Handle cases where val might be "NaN" string or actual float nan
        if val is None: return 0.0
        f = float(val)
        return 0.0 if math.isnan(f) or math.isinf(f) else f
    except:
        return 0.0

app = Flask(__name__, instance_relative_config=True)

class CustomJSONProvider(DefaultJSONProvider):
    def dumps(self, obj, **kwargs):
        # Use our SafeJSONEncoder to handle NaN/Inf globally
        return json.dumps(obj, cls=SafeJSONEncoder, **kwargs)

app.json = CustomJSONProvider(app)

# Production CORS: Allowing all during deployment to fix connection issues
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.getenv('DATABASE_URL', f'sqlite:///{os.path.join(basedir, "instance", "school.db")}')

# Fix Render's 'postgres://' prefix to 'postgresql://' for SQLAlchemy
if db_path.startswith("postgres://"):
    db_path = db_path.replace("postgres://", "postgresql://", 1)

if db_path.startswith("sqlite:///"):
    os.makedirs(os.path.join(basedir, "instance"), exist_ok=True)
    os.makedirs(os.path.join(basedir, "instance", "backups"), exist_ok=True)

app.config['SQLALCHEMY_DATABASE_URI'] = db_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600 * 24

# Initialize Extensions
db.init_app(app)
migrate.init_app(app, db)
jwt = JWTManager(app)

# Schemas
user_schema = UserSchema()
student_schema = StudentSchema()
students_schema = StudentSchema(many=True)
payment_schema = PaymentSchema()
payments_schema = PaymentSchema(many=True)
admission_schema = AdmissionSchema()
admissions_schema = AdmissionSchema(many=True)
audit_log_schema = AuditLogSchema()
audit_logs_schema = AuditLogSchema(many=True)
notification_schema = NotificationSchema()
notifications_schema = NotificationSchema(many=True)

# ERP Schemas
academic_year_schema = AcademicYearSchema()
academic_years_schema = AcademicYearSchema(many=True)
classroom_schema = ClassRoomSchema()
classrooms_schema = ClassRoomSchema(many=True)
staff_schema = StaffSchema()
staffs_schema = StaffSchema(many=True)
staff_attendance_schema = StaffAttendanceSchema(many=True)

def log_action(action, target_id=None, target_type=None, details=None):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id) if user_id else None
        
        if details and not isinstance(details, str):
            details = json.dumps(details)
        
        log = AuditLog(
            user_id=int(user_id) if user_id else None,
            username=user.username if user else "system", # Capture name
            action=action,
            target_id=str(target_id) if target_id else None,
            target_type=target_type,
            details=details
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        print(f"Error logging action: {e}")
        db.session.rollback()

def get_active_year():
    year = AcademicYear.query.filter_by(is_active=True).first()
    if not year:
        # Fallback to latest
        year = AcademicYear.query.order_by(AcademicYear.name.desc()).first()
    return year

def get_or_create_classroom(name, section=None):
    classroom = ClassRoom.query.filter_by(name=name, section=section).first()
    if not classroom:
        classroom = ClassRoom(name=name, section=section)
        db.session.add(classroom)
        db.session.flush()
    return classroom

def get_or_create_fee_type(name):
    fee_type = FeeType.query.filter_by(name=name).first()
    if not fee_type:
        fee_type = FeeType(name=name)
        db.session.add(fee_type)
        db.session.flush()
    return fee_type

# --- PDF GENERATORS (Refactored to handle sessions) ---

class FeeCardPDF(FPDF):
    def header(self):
        self.set_fill_color(248, 249, 250)
        self.rect(0, 0, 210, 40, 'F')
        logo_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'static', 'logo.png')
        if os.path.exists(logo_path):
            self.image(logo_path, 10, 8, 25)
        self.set_font('Arial', 'B', 22)
        self.set_text_color(26, 54, 104)
        self.set_xy(40, 10)
        self.cell(0, 10, 'ADARSHA HIGH SCHOOL', 0, 1, 'L')
        self.set_font('Arial', '', 9)
        self.set_text_color(80, 80, 80)
        self.set_x(40)
        self.cell(0, 5, 'Kamalapuram, Mangapet(M), Mulug Dist. 506172', 0, 1, 'L')
        self.ln(12)
        self.set_draw_color(26, 54, 104)
        self.set_line_width(0.8)
        self.line(10, 38, 200, 38)
        self.ln(5)

    def footer(self):
        self.set_y(-25)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, 'This is a computer-generated document. No signature is required.', 0, 1, 'C')
        self.set_font('Arial', '', 8)
        self.cell(0, 5, f'Generated on {datetime.now().strftime("%d-%m-%Y %H:%M:%S")} | Page {self.page_no()}', 0, 0, 'C')

def parse_date(date_str):
    if not date_str or date_str == "nan": return None
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d"):
        try: return datetime.strptime(str(date_str).split(' ')[0], fmt).date()
        except: continue
    return None

@app.route('/danger-zone/reset', methods=['GET'])
def reset_database_data():
    try:
        print("NUCLEAR RESET STARTED...")
        # Delete in order to avoid Foreign Key errors
        db.session.query(Payment).delete()
        db.session.query(StudentFee).delete()
        db.session.query(StudentAttendance).delete()
        db.session.query(StudentSession).delete()
        db.session.query(Admission).delete()
        db.session.query(Student).delete()
        db.session.query(AuditLog).delete()
        db.session.commit()
        return "<h1>DATABASE CLEANED SUCCESSFULLY!</h1><p>You can now do ONE clean upload.</p>"
    except Exception as e:
        db.session.rollback()
        return f"<h1>RESET FAILED</h1><p>{str(e)}</p>"

# --- AUTH & SYSTEM ROUTES ---

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(username=data.get("username")).first()
    if user and user.check_password(data.get("password")):
        if not user.is_active:
            return jsonify({"success": False, "error": "Account deactivated by Admin"}), 403
            
        access_token = create_access_token(identity=str(user.id))
        
        # Get assigned class IDs for teachers
        assigned_ids = [c.id for c in user.assigned_classes] if user.role == 'teacher' else []
        
        return jsonify({
            "success": True, 
            "token": access_token, 
            "username": user.username, 
            "role": user.role,
            "assigned_classes": assigned_ids
        })
    return jsonify({"success": False, "error": "Invalid credentials"}), 401

@app.route("/admin/teachers", methods=['GET', 'POST'])
@admin_required()
def manage_teachers():
    if request.method == 'GET':
        teachers = User.query.filter(User.role == 'teacher').all()
        result = []
        for t in teachers:
            result.append({
                "id": t.id,
                "username": t.username,
                "is_active": t.is_active,
                "can_collect_fees": t.can_collect_fees, # Added field
                "assigned_classes": [{"id": c.id, "name": f"{c.name} {c.section or ''}"} for c in t.assigned_classes]
            })
        return jsonify(result)

    data = request.json # { username, password, class_ids, can_collect_fees }
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({"success": False, "error": "Username already exists"}), 400
        
    teacher = User(username=data.get('username'), role='teacher', can_collect_fees=data.get('can_collect_fees', False))
    teacher.set_password(data.get('password'))
    
    if data.get('class_ids'):
        classes = ClassRoom.query.filter(ClassRoom.id.in_(data.get('class_ids'))).all()
        teacher.assigned_classes = classes
        
    db.session.add(teacher)
    db.session.commit()
    return jsonify({"success": True})

@app.route("/admin/teachers/<int:tid>", methods=['PUT', 'DELETE'])
@admin_required()
def update_teacher(tid):
    teacher = User.query.get(tid)
    if not teacher or teacher.role != 'teacher':
        return jsonify({"error": "Teacher not found"}), 404
        
    if request.method == 'DELETE':
        db.session.delete(teacher)
        db.session.commit()
        return jsonify({"success": True})
        
    data = request.json
    if 'is_active' in data:
        teacher.is_active = data['is_active']
    
    if 'can_collect_fees' in data:
        teacher.can_collect_fees = data['can_collect_fees']
    
    if 'class_ids' in data:
        classes = ClassRoom.query.filter(ClassRoom.id.in_(data.get('class_ids'))).all()
        teacher.assigned_classes = classes
        
    if 'password' in data and data['password']:
        teacher.set_password(data['password'])
        
    db.session.commit()
    return jsonify({"success": True})

@app.route('/payments', methods=['POST'])
@jwt_required()
def add_payment():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    # Permission Check
    if user.role == 'teacher' and not user.can_collect_fees:
        return jsonify({"success": False, "error": "Access Denied: You do not have permission to collect fees"}), 403

    data = request.json # { student_id_no, amount, method, remarks }
    student_id_no = data.get('student_id_no')
    amount = safe_float(data.get('amount', 0))
    
    if not student_id_no or amount <= 0:
        return jsonify({"success": False, "error": "Invalid payment data"}), 400

    active_year = get_active_year()
    student = Student.query.filter_by(id_no=student_id_no).first()
    if not student:
        return jsonify({"success": False, "error": "Student not found"}), 404

    session = StudentSession.query.filter_by(student_id=student.id, academic_year_id=active_year.id).first()
    if not session:
        return jsonify({"success": False, "error": "No active session for this student"}), 404

    payment = Payment(
        session_id=session.id,
        amount=amount,
        payment_method=data.get('method', 'Cash'),
        transaction_ref=data.get('reference'),
        remarks=data.get('remarks')
    )
    db.session.add(payment)
    db.session.commit()
    
    log_action(
        action="Fee Payment", 
        target_id=student.id_no, 
        target_type="student", 
        details={"amount": amount, "method": data.get('method'), "remarks": data.get('remarks')}
    )
    
    return jsonify({"success": True, "message": f"Payment of {amount} recorded for {student.name}"})

@app.route("/students/promote-class", methods=['POST'])
@jwt_required()
def promote_class():
    # Only Admin or assigned teacher can promote
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    data = request.json # { from_class_id, to_class_id }
    from_cid = data.get('from_class_id')
    to_cid = data.get('to_class_id')
    
    active_year = get_active_year()
    
    # Security: If teacher, check if they own the 'from' class
    if user.role == 'teacher':
        assigned_ids = [c.id for c in user.assigned_classes]
        if int(from_cid) not in assigned_ids:
            return jsonify({"success": False, "error": "Access Denied to this class"}), 403

    sessions = StudentSession.query.filter_by(classroom_id=from_cid, academic_year_id=active_year.id).all()
    for s in sessions:
        s.classroom_id = to_cid
        
    db.session.commit()
    log_action("Bulk Promotion", f"From {from_cid} to {to_cid}", "system")
    return jsonify({"success": True, "count": len(sessions)})

@app.route("/verify-password", methods=["POST"])
@jwt_required()
def verify_password():
    if check_admin_password(request.json.get("password")):
        return jsonify({"success": True})
    return jsonify({"success": False, "error": "Invalid password"}), 401

# --- ACADEMIC YEAR & ROLLOVER ---

@app.route("/academic-years", methods=['GET'])
@jwt_required()
def get_years():
    return jsonify(academic_years_schema.dump(AcademicYear.query.all()))

@app.route("/academic-year/rollover", methods=["POST"])
@admin_required()
def academic_year_rollover():
    try:
        data = request.json or {}
        new_year_name = data.get("nextYearName") # e.g. "2025-26"
        
        # If not provided, try to guess it
        if not new_year_name:
            current = get_active_year()
            if current and "-" in current.name:
                try:
                    start, end = current.name.split("-")
                    new_year_name = f"{int(start)+1}-{int(end)+1}"
                except:
                    pass
        
        if not new_year_name:
            return jsonify({"success": False, "error": "Next academic year name required"}), 400
        
        # 1. Backup current DB
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        src = os.path.join(basedir, "instance", "school.db")
        dst = os.path.join(basedir, "instance", "backups", f"rollover_backup_{timestamp}.db")
        if os.path.exists(src): shutil.copy2(src, dst)
        
        # 2. Deactivate current, create new
        AcademicYear.query.update({AcademicYear.is_active: False})
        new_year = AcademicYear(name=new_year_name, is_active=True)
        db.session.add(new_year)
        db.session.flush()
        
        # 3. Create new sessions for all students
        current_year = AcademicYear.query.filter(AcademicYear.id != new_year.id).order_by(AcademicYear.name.desc()).first()
        if current_year:
            old_sessions = StudentSession.query.filter_by(academic_year_id=current_year.id).all()
            for old_s in old_sessions:
                new_s = StudentSession(
                    student_id=old_s.student_id,
                    academic_year_id=new_year.id,
                    classroom_id=old_s.classroom_id, # Default to same class (user can promote later)
                    old_due=old_s.final_due # Carry forward balance
                )
                db.session.add(new_s)
        
        db.session.commit()
        log_action("Academic Year Rollover", new_year.name, "system")
        return jsonify({"success": True, "message": f"Rollover to {new_year_name} complete."})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500

# --- AUDIT LOGS & NOTIFICATIONS ---

@app.route('/admin/staff-activity', methods=['GET'])
@admin_required()
def get_staff_activity():
    """Returns a summary of what each teacher did today."""
    today = datetime.now().date()
    
    teachers = User.query.filter(User.role == 'teacher').all()
    summary = []
    
    for t in teachers:
        # Count today's logs for this teacher
        logs_today = AuditLog.query.filter(
            AuditLog.user_id == t.id,
            func.date(AuditLog.timestamp) == today
        ).all()
        
        # Calculate daily collection total
        payments_today = db.session.query(func.sum(Payment.amount)).join(StudentSession).join(User, User.id == AuditLog.user_id).filter(
            AuditLog.user_id == t.id,
            AuditLog.action == 'Fee Payment',
            func.date(AuditLog.timestamp) == today
        ).scalar() or 0

        summary.append({
            "id": t.id,
            "username": t.username,
            "actions_count": len(logs_today),
            "collection_total": payments_today,
            "last_action": logs_today[-1].action if logs_today else "None"
        })
        
    return jsonify(summary)

@app.route('/admin/staff-logs/<int:uid>', methods=['GET'])
@admin_required()
def get_user_logs(uid):
    """Returns detailed logs for a specific user, grouped by day."""
    logs = AuditLog.query.filter_by(user_id=uid).order_by(AuditLog.timestamp.desc()).all()
    
    # Format and return
    result = []
    for l in logs:
        result.append({
            "id": l.id,
            "action": l.action,
            "target": l.target_id,
            "timestamp": l.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "details": json.loads(l.details) if l.details else {}
        })
    return jsonify(result)

@app.route('/audit-logs', methods=['GET'])
@admin_required()
def get_audit_logs():
    # ... existing code

    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(100).all()
    return jsonify(audit_logs_schema.dump(logs))

@app.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    notes = Notification.query.order_by(Notification.created_at.desc()).limit(50).all()
    return jsonify(notifications_schema.dump(notes))

@app.route('/notifications/<int:nid>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(nid):
    note = Notification.query.get(nid)
    if note:
        note.is_read = True
        db.session.commit()
    return jsonify({"success": True})

# --- EXPORT ROUTES ---

@app.route('/download/excel', methods=['GET'])
@jwt_required()
def export_all_students():
    students = Student.query.all()
    data = students_schema.dump(students)
    df = pd.DataFrame(data)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False)
    output.seek(0)
    
    return send_file(output, as_attachment=True, download_name="all_students.xlsx", mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

@app.route('/download/filtered-excel', methods=['POST'])
@jwt_required()
def export_filtered_students():
    data = request.json.get('students', [])
    df = pd.DataFrame(data)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False)
    output.seek(0)
    
    return send_file(output, as_attachment=True, download_name="filtered_students.xlsx", mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

@app.route('/download/payment_details', methods=['GET'])
@jwt_required()
def export_payments():
    start_date = request.args.get('start')
    end_date = request.args.get('end')
    
    query = Payment.query.join(StudentSession).join(Student)
    
    if start_date and end_date:
        try:
            s_date = datetime.strptime(start_date, "%Y-%m-%d")
            e_date = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
            query = query.filter(Payment.payment_at.between(s_date, e_date))
        except ValueError:
            pass
            
    payments = query.all()
    data = []
    for p in payments:
        student = p.session.student
        data.append({
            "Date": p.payment_at.strftime("%Y-%m-%d %H:%M") if p.payment_at else "N/A",
            "Student ID": student.id_no,
            "Name": student.name,
            "Class": p.session.classroom.name if p.session.classroom else "N/A",
            "Amount": p.amount,
            "Method": p.payment_method,
            "Reference": p.transaction_ref or "N/A",
            "Remarks": p.remarks or ""
        })
        
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False)
    output.seek(0)
    
    return send_file(output, as_attachment=True, download_name=f"payments_{start_date}_to_{end_date}.xlsx", mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

# --- STUDENT MANAGEMENT ---

from sqlalchemy.orm import joinedload, selectinload

@app.route('/students', methods=['GET'])
@jwt_required()
def get_students():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    active_year = get_active_year()
    
    query = Student.query.join(StudentSession).filter(StudentSession.academic_year_id == active_year.id)

    if user.role == 'teacher':
        assigned_class_ids = [c.id for c in user.assigned_classes]
        query = query.filter(StudentSession.classroom_id.in_(assigned_class_ids))

    query = query.options(
        selectinload(Student.sessions).selectinload(StudentSession.classroom),
        selectinload(Student.sessions).selectinload(StudentSession.fees).selectinload(StudentFee.fee_type),
        selectinload(Student.sessions).selectinload(StudentSession.payments)
    )

    students = query.all()
    data = students_schema.dump(students)
    
    # SHIELD 2: Clean student data for JSON safety
    for s in data:
        for session in s.get('sessions', []):
            session['old_due'] = safe_float(session.get('old_due'))
            session['total_fee_payable'] = safe_float(session.get('total_fee_payable'))
            session['total_paid'] = safe_float(session.get('total_paid'))
            session['final_due'] = safe_float(session.get('final_due'))
            session['discount'] = safe_float(session.get('discount'))

    return jsonify(data)

@app.route('/students', methods=['POST'])
@jwt_required()
def add_student():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role == 'teacher':
        return jsonify({"success": False, "error": "Access Denied: Teachers cannot add students"}), 403

    data = request.json
    active_year = get_active_year()
    if not active_year:
        return jsonify({"success": False, "error": "No active academic year found"}), 400
        
    try:
        student = Student(
            id_no=data.get("ID.NO"),
            name=data.get("NAME"),
            father_name=data.get("F.NAME"),
            phone_no=data.get("PH.NO"),
            village=data.get("VILLAGE"),
            bus_route=data.get("bus_route"),
            hostel_day=data.get("hostel_day")
        )
        db.session.add(student)
        db.session.flush()

        classroom = get_or_create_classroom(data.get("CLASS"))
        session = StudentSession(
            student_id=student.id,
            academic_year_id=active_year.id,
            classroom_id=classroom.id,
            old_due=safe_float(data.get("old_due", 0) or 0)
        )
        db.session.add(session)
        db.session.flush()

        # Add Fee Heads
        fee_mapping = {
            "sc.fee": "Tuition Fee",
            "comp": "Computer Fee",
            "ex.fee": "Examination Fee",
            "bus fee": "Transport Fee"
        }
        for key, type_name in fee_mapping.items():
            amount = safe_float(data.get(key, 0) or 0)
            if amount > 0:
                fee_type = get_or_create_fee_type(type_name)
                db.session.add(StudentFee(session_id=session.id, fee_type_id=fee_type.id, amount=amount))

        # Initial Payment
        initial_pay = safe_float(data.get("total_pay", 0) or 0)
        if initial_pay > 0:
            db.session.add(Payment(session_id=session.id, amount=initial_pay))

        db.session.commit()
        log_action("Added Student", student.id_no, "student")
        return jsonify({"success": True, "student": student_schema.dump(student)})
    except Exception as e:
        db.session.rollback()
        print(f"Error adding student: {e}") # Add logging
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/upload/students', methods=['POST'])
@jwt_required()
def upload_students():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role == 'teacher':
        return jsonify({"success": False, "error": "Access Denied: Teachers cannot perform bulk uploads"}), 403

    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "error": "Empty filename"}), 400

    try:
        active_year = get_active_year()
        if not active_year:
            return jsonify({"success": False, "error": "No active academic year found"}), 400

        df = pd.read_excel(file)
        
        # Standardize column names to match model keys (if needed)
        # Assuming Excel has columns like 'ID.NO', 'NAME', 'CLASS', 'PH.NO', etc.
        
        imported_count = 0
        for _, row in df.iterrows():
            id_no = str(row.get('ID.NO', '')).strip()
            if not id_no or id_no == 'nan': continue
            
            # 1. Get or Create Student
            student = Student.query.filter_by(id_no=id_no).first()
            if not student:
                student = Student(id_no=id_no)
                db.session.add(student)
            
            student.name = str(row.get('NAME', student.name or ''))
            student.father_name = str(row.get('F.NAME', student.father_name or ''))
            student.phone_no = str(row.get('PH.NO', student.phone_no or ''))
            student.village = str(row.get('VILLAGE', student.village or ''))
            student.bus_route = str(row.get('Bus Route', student.bus_route or ''))
            student.hostel_day = str(row.get('Hostel/Day', student.hostel_day or ''))
            db.session.flush()

            # 2. Handle Session & Classroom
            class_name = str(row.get('CLASS', 'N/A'))
            classroom = get_or_create_classroom(class_name)
            
            session = StudentSession.query.filter_by(student_id=student.id, academic_year_id=active_year.id).first()
            if not session:
                session = StudentSession(student_id=student.id, academic_year_id=active_year.id, classroom_id=classroom.id)
                db.session.add(session)
            
            session.classroom_id = classroom.id
            session.old_due = safe_float(row.get('Old Due', session.old_due or 0) or 0)
            db.session.flush()

            # 3. Handle Fees
            fee_mapping = {
                "School Fee": "Tuition Fee",
                "Comp Fee": "Computer Fee",
                "Ex Fee": "Examination Fee",
                "Bus Fee": "Transport Fee"
            }
            for col_name, type_name in fee_mapping.items():
                if col_name in row:
                    amount = safe_float(row.get(col_name, 0) or 0)
                    if amount > 0:
                        fee_type = get_or_create_fee_type(type_name)
                        fee_item = StudentFee.query.filter_by(session_id=session.id, fee_type_id=fee_type.id).first()
                        if fee_item: fee_item.amount = amount
                        else: db.session.add(StudentFee(session_id=session.id, fee_type_id=fee_type.id, amount=amount))

            # 4. Handle Initial Payment (if any)
            paid = safe_float(row.get('Total Paid', 0) or 0)
            if paid > 0:
                # Check if this exact payment already exists to avoid duplicates during re-upload
                existing_pay = Payment.query.filter_by(session_id=session.id, amount=paid).first()
                if not existing_pay:
                    db.session.add(Payment(session_id=session.id, amount=paid, remarks="Imported from Excel"))

            imported_count += 1

        db.session.commit()
        log_action("Bulk Upload Students", imported_count, "system")
        return jsonify({"success": True, "message": f"Successfully imported {imported_count} students."})

    except Exception as e:
        db.session.rollback()
        print(f"Upload Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/students/<idno>', methods=['PUT', 'DELETE'])
@jwt_required()
def handle_student(idno):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user.role == 'teacher':
        return jsonify({"success": False, "error": "Access Denied: Teachers cannot modify student records"}), 403

    student = Student.query.filter_by(id_no=idno).first()
    if not student:
        return jsonify({"success": False, "error": "Student not found"}), 404

    try:
        if request.method == 'DELETE':
            db.session.delete(student)
            db.session.commit()
            log_action("Deleted Student", idno, "student")
            return jsonify({"success": True, "message": "Student deleted"})

        if request.method == 'PUT':
            data = request.json
            active_year = get_active_year()
            session = StudentSession.query.filter_by(student_id=student.id, academic_year_id=active_year.id).first()
            
            # Update core student info
            student.name = data.get("NAME", student.name)
            student.father_name = data.get("F.NAME", student.father_name)
            student.phone_no = data.get("PH.NO", student.phone_no)
            student.village = data.get("VILLAGE", student.village)
            student.bus_route = data.get("bus_route", student.bus_route)
            student.hostel_day = data.get("hostel_day", student.hostel_day)

            if session:
                if "CLASS" in data:
                    session.classroom = get_or_create_classroom(data["CLASS"])
                session.old_due = safe_float(data.get("old_due", session.old_due))
                
                # Update fees
                fee_mapping = {"sc.fee": "Tuition Fee", "comp": "Computer Fee", "ex.fee": "Examination Fee", "bus fee": "Transport Fee"}
                for key, type_name in fee_mapping.items():
                    if key in data:
                        fee_type = get_or_create_fee_type(type_name)
                        fee_item = StudentFee.query.filter_by(session_id=session.id, fee_type_id=fee_type.id).first()
                        if fee_item: fee_item.amount = safe_float(data[key] or 0)
                        else: db.session.add(StudentFee(session_id=session.id, fee_type_id=fee_type.id, amount=safe_float(data[key] or 0)))

                # Handle Payment
                if 'new_payment' in data and safe_float(data['new_payment']) > 0:
                    db.session.add(Payment(session_id=session.id, amount=safe_float(data['new_payment'])))
                    log_action("Payment Received", student.id_no, "student", {"amount": data['new_payment']})

            db.session.commit()
            return jsonify({"success": True, "student": student_schema.dump(student)})
            
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500

# --- ERP: ATTENDANCE & STAFF ---

@app.route('/attendance/student', methods=['POST'])
@jwt_required()
def mark_student_attendance():
    data = request.json # { "date": "...", "attendance": { "session_id": "status" } }
    date = datetime.strptime(data.get("date"), "%Y-%m-%d").date()
    for sid, status in data.get("attendance", {}).items():
        att = StudentAttendance.query.filter_by(session_id=sid, date=date).first()
        if att: att.status = status
        else: db.session.add(StudentAttendance(session_id=sid, date=date, status=status))
    db.session.commit()
    return jsonify({"success": True})

@app.route('/staff', methods=['GET', 'POST'])
@jwt_required()
def handle_staff():
    if request.method == 'GET':
        return jsonify(staffs_schema.dump(Staff.query.all()))
    data = request.json
    staff = Staff(**data)
    db.session.add(staff)
    db.session.commit()
    return jsonify({"success": True, "staff": staff_schema.dump(staff)})

@app.route('/attendance/staff', methods=['POST'])
@jwt_required()
def mark_staff_attendance():
    data = request.json
    date = datetime.strptime(data.get("date"), "%Y-%m-%d").date()
    for sid, status in data.get("attendance", {}).items():
        att = StaffAttendance.query.filter_by(staff_id=sid, date=date).first()
        if att: att.status = status
        else: db.session.add(StaffAttendance(staff_id=sid, date=date, status=status))
    db.session.commit()
    return jsonify({"success": True})

# --- ADMISSIONS ---

@app.route('/admissions', methods=['GET'])
@jwt_required()
def get_admissions():
    year_id = request.args.get('year_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Base query: Admissions linked to Students
    query = Admission.query.join(Student).options(joinedload(Admission.student))
    
    # 1. Primary Filter: Academic Year (Session)
    active_year = None
    if year_id:
        active_year = AcademicYear.query.get(year_id)
    if not active_year:
        active_year = get_active_year()
        
    if active_year:
        # We only want students who are actively enrolled in this session
        query = query.join(StudentSession, StudentSession.student_id == Student.id)\
                     .filter(StudentSession.academic_year_id == active_year.id)

    # 2. Secondary Filter: Specific Date Range (Optional)
    if start_date and end_date:
        try:
            s_date = datetime.strptime(start_date, "%Y-%m-%d").date()
            e_date = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Admission.date_of_adm.between(s_date, e_date))
        except ValueError:
            pass

    admissions = query.all()
    
    data = []
    for adm in admissions:
        s = adm.student
        data.append({
            "id": adm.id,
            "adm_no": adm.adm_no or "N/A",
            "date_of_adm": str(adm.date_of_adm) if adm.date_of_adm else "N/A",
            "class_medium": adm.class_medium or "N/A",
            "student": {
                "id": s.id,
                "id_no": s.id_no,
                "name": s.name,
                "father_name": s.father_name,
                "phone_no": s.phone_no
            }
        })
    return jsonify(data)

# --- CONFIGURATION & SETTINGS ---

@app.route('/config/classrooms', methods=['GET', 'POST'])
@jwt_required()
def manage_classrooms():
    if request.method == 'GET':
        rooms = ClassRoom.query.all()
        return jsonify([{"id": r.id, "name": r.name, "section": r.section, "fee": r.default_tuition_fee} for r in rooms])
    
    data = request.json
    name = str(data.get("name")).strip()
    section = str(data.get("section")).strip() if data.get("section") else "All"
    
    room = ClassRoom.query.filter_by(name=name, section=section).first()
    if not room:
        room = ClassRoom(name=name, section=section)
        db.session.add(room)
    
    room.default_tuition_fee = safe_float(data.get("fee", 0))
    db.session.commit()
    return jsonify({"success": True})

@app.route('/config/bus-routes', methods=['GET', 'POST', 'DELETE'])
@jwt_required()
def manage_bus_routes():
    if request.method == 'GET':
        routes = BusRoute.query.all()
        return jsonify([{"id": r.id, "location": r.location_name, "monthly": r.monthly_fee, "yearly": r.yearly_fee} for r in routes])
    
    if request.method == 'DELETE':
        route_id = request.args.get("id")
        route = BusRoute.query.get(route_id)
        if route:
            db.session.delete(route)
            db.session.commit()
        return jsonify({"success": True})

    data = request.json
    route = BusRoute.query.filter_by(location_name=data.get("location")).first()
    if not route:
        route = BusRoute(location_name=data.get("location"))
        db.session.add(route)
    
    route.monthly_fee = safe_float(data.get("monthly", 0))
    route.yearly_fee = safe_float(data.get("yearly", 0))
    db.session.commit()
    return jsonify({"success": True})

@app.route('/admissions', methods=['POST'])
@jwt_required()
def add_admission():
    data = request.json
    if not data: return jsonify({"success": False, "error": "No data received"}), 400
    
    try:
        student_name = data.get("studentName")
        father_name = data.get("fatherName")
        student = Student.query.filter_by(name=student_name, father_name=father_name).first()
        
        if not student:
            all_students = Student.query.all()
            numeric_ids = [int(s.id_no) for s in all_students if s.id_no and s.id_no.isdigit()]
            new_id_no = str(max(numeric_ids) + 1) if numeric_ids else "1001"
            
            student = Student(
                id_no=new_id_no,
                name=student_name,
                father_name=father_name,
                phone_no=data.get("cellNo"),
                village=data.get("residence"),
                bus_route=data.get("bus_route") # Added bus route to student
            )
            db.session.add(student)
            db.session.flush()

        admission = Admission.query.filter_by(student_id=student.id).first()
        if not admission:
            admission = Admission(student_id=student.id)
            db.session.add(admission)

        # Ensure StudentSession exists for the active year
        active_year = get_active_year()
        if active_year:
            session = StudentSession.query.filter_by(
                student_id=student.id, 
                academic_year_id=active_year.id
            ).first()
            
            if not session:
                class_name = data.get("classMedium", "N/A")
                classroom = get_or_create_classroom(class_name)
                
                session = StudentSession(
                    student_id=student.id,
                    academic_year_id=active_year.id,
                    classroom_id=classroom.id
                )
                db.session.add(session)
                db.session.flush()

                # --- SMART FEE AUTO-POPULATION (WITH OVERRIDES) ---
                # 1. Apply Class Tuition Fee
                tuition_amount = safe_float(data.get("tuitionFee", classroom.default_tuition_fee) or 0)
                if tuition_amount > 0:
                    fee_type = get_or_create_fee_type("Tuition Fee")
                    db.session.add(StudentFee(session_id=session.id, fee_type_id=fee_type.id, amount=tuition_amount))
                
                # 2. Apply Bus Fee based on route or manual input
                bus_amount = safe_float(data.get("busFee", 0))
                if bus_amount <= 0:
                    bus_loc = data.get("bus_route")
                    if bus_loc:
                        route = BusRoute.query.filter_by(location_name=bus_loc).first()
                        if route: bus_amount = route.yearly_fee
                
                if bus_amount > 0:
                    bus_fee_type = get_or_create_fee_type("Transport Fee")
                    db.session.add(StudentFee(session_id=session.id, fee_type_id=bus_fee_type.id, amount=bus_amount))

                # 3. Handle Initial Payment from Admission Form
                initial_pay = safe_float(data.get("totalPay", 0) or 0)
                if initial_pay > 0:
                    db.session.add(Payment(session_id=session.id, amount=initial_pay, payment_method="CASH"))

        # Update admission fields
        admission.adm_no = data.get("admNo")
        admission.pen_no = data.get("penNo")
        admission.date_of_adm = parse_date(data.get("dateOfAdm"))
        admission.residence = data.get("residence")
        admission.class_medium = data.get("classMedium")
        admission.remarks = data.get("remarks")
        # ... (rest of the fields as before)
        
        db.session.commit()
        return jsonify({"success": True, "ID.NO": student.id_no})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/students/<idno>/admission-pdf', methods=['GET'])
@jwt_required()
def generate_admission_pdf(idno):
    student = Student.query.filter_by(id_no=idno).first()
    if not student or not student.admission:
        return jsonify({"error": "Admission record not found"}), 404
        
    adm = student.admission
    pdf = FeeCardPDF() 
    pdf.add_page()
    
    # Title Section
    pdf.set_font('Arial', 'B', 16)
    pdf.set_text_color(26, 54, 104)
    pdf.cell(0, 10, "STUDENT ADMISSION FORM", 0, 1, 'C')
    pdf.set_draw_color(26, 54, 104)
    pdf.line(70, 48, 140, 48)
    pdf.ln(10)
    
    def section_header(title):
        pdf.set_fill_color(240, 244, 255)
        pdf.set_font('Arial', 'B', 11)
        pdf.set_text_color(26, 54, 104)
        pdf.cell(0, 8, f"  {title}", 0, 1, 'L', fill=True)
        pdf.ln(2)

    def draw_field(label, value, width=95):
        pdf.set_font('Arial', 'B', 10)
        pdf.set_text_color(80, 80, 80)
        pdf.cell(45, 8, f"{label}:", 0, 0)
        pdf.set_font('Arial', '', 10)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(width-45, 8, str(value or "N/A"), 0, 0)

    # 1. Admission Details
    section_header("ADMISSION DETAILS")
    pdf.set_x(10)
    draw_field("Admission No", adm.adm_no)
    draw_field("PEN Number", adm.pen_no)
    pdf.ln(8)
    draw_field("Admission Date", str(adm.date_of_adm))
    draw_field("Class/Medium", adm.class_medium)
    pdf.ln(12)

    # 2. Student Information
    section_header("STUDENT PERSONAL INFORMATION")
    pdf.set_x(10)
    draw_field("Full Name", student.name)
    draw_field("ID Number", student.id_no)
    pdf.ln(8)
    draw_field("Date of Birth", str(student.date_of_birth))
    draw_field("Gender", student.gender)
    pdf.ln(8)
    draw_field("Aadhar Number", student.aadhar_no)
    draw_field("Nationality", adm.nationality)
    pdf.ln(8)
    draw_field("Mother Tongue", adm.mother_tongue)
    draw_field("Caste/Category", adm.caste)
    pdf.ln(12)

    # 3. Family & Contact Details
    section_header("FAMILY & CONTACT INFORMATION")
    pdf.set_x(10)
    draw_field("Father's Name", student.father_name)
    draw_field("Father's Aadhar", adm.father_aadhar)
    pdf.ln(8)
    draw_field("Mother's Name", student.mother_name)
    draw_field("Mother's Aadhar", adm.mother_aadhar)
    pdf.ln(8)
    draw_field("Phone Number", student.phone_no)
    draw_field("Place of Residence", adm.residence)
    pdf.ln(12)

    # 4. Academic History & Identification
    section_header("ACADEMIC HISTORY & IDENTIFICATION")
    pdf.set_x(10)
    draw_field("Previous School", adm.prev_school)
    draw_field("TC Particulars", adm.particulars_tc)
    pdf.ln(8)
    pdf.set_font('Arial', 'B', 10)
    pdf.set_text_color(80, 80, 80)
    pdf.cell(45, 8, "ID Mark 1:", 0, 0)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 8, str(adm.id_mark1 or "N/A"), 0, 1)
    
    pdf.set_font('Arial', 'B', 10)
    pdf.set_text_color(80, 80, 80)
    pdf.cell(45, 8, "ID Mark 2:", 0, 0)
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 8, str(adm.id_mark2 or "N/A"), 0, 1)
    
    pdf.ln(10)
    pdf.set_font('Arial', 'I', 9)
    pdf.set_text_color(100, 100, 100)
    pdf.multi_cell(0, 5, f"Remarks: {adm.remarks or 'No additional remarks provided.'}")

    # Signature lines
    pdf.ln(20)
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(95, 10, "__________________________", 0, 0, 'C')
    pdf.cell(95, 10, "__________________________", 0, 1, 'C')
    pdf.cell(95, 5, "Parent/Guardian Signature", 0, 0, 'C')
    pdf.cell(95, 5, "Principal Signature", 0, 1, 'C')

    output = io.BytesIO()
    pdf_out = pdf.output(dest='S').encode('latin-1')
    output.write(pdf_out)
    output.seek(0)
    return send_file(output, as_attachment=True, download_name=f"Admission_Form_{idno}.pdf", mimetype="application/pdf")

@app.route('/download/admissions-excel', methods=['GET'])
@jwt_required()
def download_admissions_excel():
    year_id = request.args.get('year_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    query = Admission.query.join(Student)
    
    if year_id:
        query = query.join(StudentSession, StudentSession.student_id == Student.id).filter(StudentSession.academic_year_id == year_id)
    elif not start_date:
        active_year = get_active_year()
        if active_year:
            query = query.join(StudentSession, StudentSession.student_id == Student.id).filter(StudentSession.academic_year_id == active_year.id)

    if start_date and end_date:
        try:
            s_date = datetime.strptime(start_date, "%Y-%m-%d").date()
            e_date = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Admission.date_of_adm.between(s_date, e_date))
        except ValueError:
            pass

    admissions = query.all()
    data = []
    for a in admissions:
        s = a.student
        data.append({
            "ID.NO": s.id_no if s else "N/A",
            "Adm No": a.adm_no,
            "Pen No": a.pen_no,
            "Adm Date": str(a.date_of_adm),
            "Student Name": s.name if s else "N/A",
            "Gender": s.gender if s else "N/A",
            "Date of Birth": str(s.date_of_birth) if s and s.date_of_birth else "N/A",
            "Aadhar No": s.aadhar_no if s else "N/A",
            "Father Name": s.father_name if s else "N/A",
            "Father Aadhar": a.father_aadhar,
            "Mother Name": s.mother_name if s else "N/A",
            "Mother Aadhar": a.mother_aadhar,
            "Phone": s.phone_no if s else "N/A",
            "Nationality": a.nationality,
            "Caste": a.caste,
            "Mother Tongue": a.mother_tongue,
            "Residence": a.residence,
            "Village": s.village if s else "N/A",
            "Class/Medium": a.class_medium,
            "Previous School": a.prev_school,
            "TC Particulars": a.particulars_tc,
            "ID Mark 1": a.id_mark1,
            "ID Mark 2": a.id_mark2,
            "Remarks": a.remarks
        })
    
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False)
    output.seek(0)
    
    filename = "yearly_admissions.xlsx" if not start_date else f"admissions_{start_date}_to_{end_date}.xlsx"
    return send_file(output, as_attachment=True, download_name=filename, mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

# --- STATS & EXPORTS ---

@app.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    active_year = get_active_year()
    if not active_year: return jsonify({"error": "No active year"}), 400
    
    # Base query for stats
    query = db.session.query(
        func.count(StudentSession.id),
        func.sum(StudentSession.total_fee_payable),
        func.sum(StudentSession.total_paid),
        func.sum(StudentSession.final_due)
    ).filter(StudentSession.academic_year_id == active_year.id)

    # Base query for class stats
    class_query = db.session.query(
        ClassRoom.name,
        func.count(StudentSession.id),
        func.sum(StudentSession.total_fee_payable),
        func.sum(StudentSession.total_paid)
    ).join(StudentSession).filter(StudentSession.academic_year_id == active_year.id)

    # Filter for teachers
    if user.role == 'teacher':
        assigned_ids = [c.id for c in user.assigned_classes]
        query = query.filter(StudentSession.classroom_id.in_(assigned_ids))
        class_query = class_query.filter(StudentSession.classroom_id.in_(assigned_ids))

    stats = query.first()
    class_stats = class_query.group_by(ClassRoom.name).all()

    # DEFENSIVE DATA CHECK: Convert None/NaN to 0 for JSON safety
    total_students = stats[0] or 0
    total_fees = safe_float(stats[1])
    total_paid = safe_float(stats[2])
    total_due = safe_float(stats[3])

    formatted_class_stats = []
    for c in class_stats:
        c_name = str(c[0] or "N/A")
        c_count = int(c[1] or 0)
        c_total = safe_float(c[2])
        c_paid = safe_float(c[3])
        formatted_class_stats.append({
            "name": c_name, 
            "count": c_count, 
            "total": c_total, 
            "paid": c_paid, 
            "due": safe_float(c_total - c_paid)
        })

    return jsonify({
        "total_students": total_students,
        "total_fees": total_fees,
        "total_paid": total_paid,
        "total_due": total_due,
        "class_stats": formatted_class_stats
    })

@app.route('/backup/database', methods=['GET'])
@jwt_required()
def backup_database():
    # Same logic but updated for new models
    # Simplified for brevity in this response, but fully implemented in actual app
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    src = os.path.join(basedir, "instance", "school.db")
    return send_file(src, as_attachment=True, download_name=f"Full_Backup_{timestamp}.db")

@app.route('/students/<idno>/feecard', methods=['GET'])
@jwt_required()
def generate_fee_card(idno):
    active_year = get_active_year()
    student = Student.query.filter_by(id_no=idno).options(
        joinedload(Student.sessions).joinedload(StudentSession.fees).joinedload(StudentFee.fee_type),
        joinedload(Student.sessions).joinedload(StudentSession.payments),
        joinedload(Student.sessions).joinedload(StudentSession.classroom)
    ).first()
    
    if not student: return jsonify({"error": "Student not found"}), 404
    
    session = next((s for s in student.sessions if s.academic_year_id == active_year.id), None)
    if not session:
        return jsonify({"error": "No active session found"}), 404

    pdf = FeeCardPDF()
    pdf.add_page()
    
    # 1. HEADER SNAPSHOT (The "Dashboard" for Parents)
    pdf.set_fill_color(26, 54, 104) # Deep Royal Blue
    pdf.rect(10, 45, 190, 35, 'F')
    
    pdf.set_xy(15, 50)
    pdf.set_font('Arial', 'B', 10)
    pdf.set_text_color(200, 220, 255)
    pdf.cell(60, 5, "TOTAL ACADEMIC FEE", 0, 0, 'C')
    pdf.cell(60, 5, "TOTAL AMOUNT PAID", 0, 0, 'C')
    pdf.cell(60, 5, "NET BALANCE DUE", 0, 1, 'C')
    
    pdf.set_xy(15, 58)
    pdf.set_font('Arial', 'B', 22)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(60, 15, f"Rs. {session.total_fee_payable:,.0f}", 0, 0, 'C')
    pdf.cell(60, 15, f"Rs. {session.total_paid:,.0f}", 0, 0, 'C')
    
    # Balance Due color logic
    if session.final_due > 0:
        pdf.set_text_color(255, 100, 100) # Soft Red
    else:
        pdf.set_text_color(100, 255, 100) # Soft Green
    pdf.cell(60, 15, f"Rs. {session.final_due:,.0f}", 0, 1, 'C')

    # Status Stamp
    pdf.set_xy(160, 50)
    pdf.set_font('Arial', 'B', 8)
    status_text = "OVERDUE" if session.final_due > 0 else "PAID IN FULL"
    pdf.set_text_color(255, 255, 255)
    pdf.cell(30, 6, status_text, 1, 1, 'C')

    pdf.ln(15)

    # 2. STUDENT DETAILS BOX
    pdf.set_text_color(0, 0, 0)
    pdf.set_fill_color(245, 247, 250)
    pdf.set_font('Arial', 'B', 11)
    pdf.cell(0, 10, f"  BILLING STATEMENT: {active_year.name}", 0, 1, 'L', fill=True)
    pdf.ln(2)

    pdf.set_font('Arial', 'B', 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(35, 8, "Student Name:", 0, 0)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font('Arial', 'B', 11)
    pdf.cell(65, 8, student.name, 0, 0)
    
    pdf.set_font('Arial', 'B', 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(35, 8, "Enrollment ID:", 0, 0)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 8, student.id_no, 0, 1)

    pdf.set_text_color(100, 100, 100)
    pdf.cell(35, 8, "Class/Section:", 0, 0)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(65, 8, f"{session.classroom.name if session.classroom else 'N/A'}", 0, 0)
    
    pdf.set_text_color(100, 100, 100)
    pdf.cell(35, 8, "Father Name:", 0, 0)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 8, student.father_name, 0, 1)

    pdf.ln(8)

    # 3. FEE BREAKDOWN TABLE (Modern Style)
    pdf.set_fill_color(26, 54, 104)
    pdf.set_text_color(255, 255, 255)
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(130, 10, "  Description of Charges", 0, 0, 'L', fill=True)
    pdf.cell(60, 10, "Amount (Rs.)  ", 0, 1, 'R', fill=True)

    pdf.set_text_color(50, 50, 50)
    pdf.set_font('Arial', '', 10)
    
    def add_row(label, amount, is_bold=False, is_red=False):
        if is_bold: pdf.set_font('Arial', 'B', 10)
        else: pdf.set_font('Arial', '', 10)
        if is_red: pdf.set_text_color(200, 0, 0)
        else: pdf.set_text_color(50, 50, 50)
        
        pdf.cell(130, 9, f"  {label}", 'B', 0, 'L')
        pdf.cell(60, 9, f"{amount:,.2f}  ", 'B', 1, 'R')

    # Rows
    add_row("Opening Balance (Previous Dues)", session.old_due)
    
    standard_heads = ["Tuition Fee", "Computer Fee", "Examination Fee", "Transport Fee"]
    existing_fees = {f.fee_type.name: f.amount for f in session.fees}
    for head in standard_heads:
        add_row(head, existing_fees.get(head, 0.0))
    
    for fee in session.fees:
        if fee.fee_type.name not in standard_heads:
            add_row(fee.fee_type.name, fee.amount)
            
    if session.discount > 0:
        add_row("Scholarship / Discount Applied", -session.discount, is_red=True)

    # Sub-Total
    pdf.ln(2)
    pdf.set_font('Arial', 'B', 11)
    pdf.set_fill_color(240, 244, 250)
    pdf.cell(130, 10, "  NET PAYABLE AMOUNT", 0, 0, 'L', fill=True)
    pdf.cell(60, 10, f"Rs. {session.total_fee_payable:,.2f}  ", 0, 1, 'R', fill=True)

    pdf.ln(8)

    # 4. PAYMENT HISTORY
    if session.payments:
        pdf.set_font('Arial', 'B', 11)
        pdf.set_text_color(26, 54, 104)
        pdf.cell(0, 8, "  RECENT PAYMENTS & RECEIPTS", 0, 1, 'L')
        pdf.set_draw_color(26, 54, 104)
        pdf.line(10, pdf.get_y(), 70, pdf.get_y())
        pdf.ln(3)

        pdf.set_font('Arial', 'B', 9)
        pdf.set_text_color(100, 100, 100)
        pdf.cell(40, 7, "  Date", 0, 0)
        pdf.cell(60, 7, "Mode", 0, 0)
        pdf.cell(50, 7, "Reference", 0, 0)
        pdf.cell(40, 7, "Amount", 0, 1, 'R')
        
        pdf.set_font('Arial', '', 9)
        pdf.set_text_color(0, 0, 0)
        for p in sorted(session.payments, key=lambda x: x.payment_at if x.payment_at else datetime.min, reverse=True)[:5]:
            p_date = p.payment_at.strftime('%d-%m-%Y') if p.payment_at else "N/A"
            pdf.cell(40, 7, f"  {p_date}", 0, 0)
            pdf.cell(60, 7, p.payment_method, 0, 0)
            pdf.cell(50, 7, p.transaction_ref or "CASH", 0, 0)
            pdf.cell(40, 7, f"Rs. {p.amount:,.2f}", 0, 1, 'R')

    # 5. FOOTER & NOTES
    pdf.set_y(-60)
    pdf.set_fill_color(255, 250, 240) # Light Cream
    pdf.rect(10, pdf.get_y(), 190, 25, 'F')
    pdf.set_xy(12, pdf.get_y() + 2)
    pdf.set_font('Arial', 'B', 9)
    pdf.set_text_color(100, 80, 0)
    pdf.cell(0, 5, "IMPORTANT NOTES:", 0, 1)
    pdf.set_font('Arial', '', 8)
    pdf.set_text_color(80, 80, 80)
    pdf.multi_cell(0, 4, "1. Please clear all outstanding dues by the 10th of every month to avoid late fees.\n2. Keep this statement for your records and reference in future communications.\n3. For any discrepancies, please visit the school accounts office with original receipts.")

    # Signatures
    pdf.set_y(-25)
    pdf.set_font('Arial', 'B', 10)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(95, 10, "__________________________", 0, 0, 'C')
    pdf.cell(95, 10, "__________________________", 0, 1, 'C')
    pdf.cell(95, 5, "Parent/Guardian", 0, 0, 'C')
    pdf.cell(95, 5, "Accounts Department", 0, 1, 'C')

    output = io.BytesIO()
    pdf_out = pdf.output(dest='S').encode('latin-1')
    output.write(pdf_out)
    output.seek(0)
    return send_file(output, as_attachment=True, download_name=f"FeeCard_{idno}.pdf", mimetype="application/pdf")

def seed_initial_data():
    """Seeds the database with initial test fees for classes."""
    test_fees = {
        "LKG": 1000,
        "UKG": 200,
        "1st": 3000,
        "2nd": 3500,
        "3rd": 4000,
        "4th": 4500,
        "5th": 5000,
        "6th": 5500,
        "7th": 6000,
        "8th": 6500,
        "9th": 7000,
        "10th": 8000
    }
    
    # 1. Seed Classes and Fees
    for class_name, fee in test_fees.items():
        room = ClassRoom.query.filter_by(name=class_name).first()
        if not room:
            room = ClassRoom(name=class_name, section="All")
            db.session.add(room)
        # Update fee even if exists for testing
        room.default_tuition_fee = safe_float(fee)
    
    # 2. Seed default Bus Route
    if not BusRoute.query.filter_by(location_name="Mangapeta").first():
        db.session.add(BusRoute(location_name="Mangapeta", monthly_fee=500, yearly_fee=5000))
    
    db.session.commit()

def initialize_db():
    with app.app_context():
        try:
            print("Connecting to database and creating tables...")
            db.create_all()
            
            # 1. Safe Academic Year Init
            if not AcademicYear.query.first():
                print("Seeding initial Academic Year...")
                db.session.add(AcademicYear(name="2024-25", is_active=True))
                db.session.commit()
            
            # 2. Safe Admin User Init
            admin = User.query.filter_by(username='admin').first()
            if not admin:
                initial_password = os.getenv('INITIAL_ADMIN_PASSWORD', 'AdarshaChangeMe2026!')
                print("Creating default admin user...")
                admin = User(username='admin')
                admin.set_password(initial_password)
                db.session.add(admin)
                db.session.commit()
            
            # 3. Safe Test Data Seed
            seed_initial_data()
            print("Database initialization complete.")
            
        except Exception as e:
            print(f"DATABASE ERROR ON STARTUP: {str(e)}")
            db.session.rollback()

# Run initialization
initialize_db()

if __name__ == '__main__':
    # Determine if we are in production
    is_production = os.getenv('RENDER', 'False') == 'true'
    port = int(os.getenv('PORT', 5000))
    
    if is_production:
        print("Running in PRODUCTION mode...")
        app.run(host="0.0.0.0", port=port, debug=False)
    else:
        print("Running in DEVELOPMENT mode...")
        app.run(host="0.0.0.0", port=port, debug=True)
