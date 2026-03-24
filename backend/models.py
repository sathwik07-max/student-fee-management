from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import datetime, timezone
from passlib.hash import bcrypt
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import func, select

db = SQLAlchemy()
migrate = Migrate()

# --- SYSTEM MODELS ---

# Association table for Teachers and Classes
teacher_classes = db.Table('teacher_classes',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('classroom_id', db.Integer, db.ForeignKey('classrooms.id'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='admin') # admin, teacher, accountant
    is_active = db.Column(db.Boolean, default=True)
    can_collect_fees = db.Column(db.Boolean, default=False)
    
    # For Teachers: Which classes they can manage
    assigned_classes = db.relationship('ClassRoom', secondary=teacher_classes, backref='assigned_teachers')

    def set_password(self, password):
        self.password_hash = bcrypt.hash(password)

    def check_password(self, password):
        return bcrypt.verify(password, self.password_hash)

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    username = db.Column(db.String(50)) # Added for easier tracking
    action = db.Column(db.String(255), nullable=False)
    target_id = db.Column(db.String(50))
    target_type = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    details = db.Column(db.Text)

    user = db.relationship('User', backref='logs')

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(500), nullable=False)
    type = db.Column(db.String(50), default='info')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    is_read = db.Column(db.Boolean, default=False)

# --- ACADEMIC STRUCTURE ---

class AcademicYear(db.Model):
    __tablename__ = 'academic_years'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), unique=True, nullable=False) # e.g., "2024-25"
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    is_active = db.Column(db.Boolean, default=False)

    sessions = db.relationship('StudentSession', backref='academic_year', lazy=True)

class ClassRoom(db.Model):
    __tablename__ = 'classrooms'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False) # e.g., "10th", "9th"
    section = db.Column(db.String(10)) # e.g., "A", "B"
    default_tuition_fee = db.Column(db.Float, default=0.0)
    
    sessions = db.relationship('StudentSession', backref='classroom', lazy=True)

class BusRoute(db.Model):
    __tablename__ = 'bus_routes'
    id = db.Column(db.Integer, primary_key=True)
    location_name = db.Column(db.String(100), unique=True, nullable=False)
    monthly_fee = db.Column(db.Float, default=0.0)
    yearly_fee = db.Column(db.Float, default=0.0)

# --- STUDENT & FEES ---

class Student(db.Model):
    __tablename__ = 'students'
    id = db.Column(db.Integer, primary_key=True)
    s_no = db.Column(db.Integer)
    id_no = db.Column(db.String(50), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False, index=True)
    father_name = db.Column(db.String(100), index=True)
    mother_name = db.Column(db.String(100))
    phone_no = db.Column(db.String(20))
    village = db.Column(db.String(100), index=True)
    bus_route = db.Column(db.String(100))
    hostel_day = db.Column(db.String(50)) # Hosteler/Dayscholar
    
    admission_no = db.Column(db.String(50), unique=True)
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(20))
    aadhar_no = db.Column(db.String(20))
    status = db.Column(db.String(20), default='Active') # Active, Alumni, Left

    sessions = db.relationship('StudentSession', backref='student', lazy=True, cascade="all, delete-orphan")
    admission = db.relationship('Admission', backref='student', uselist=False, cascade="all, delete-orphan")

class StudentSession(db.Model):
    """Links a student to an academic year and a class."""
    __tablename__ = 'student_sessions'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    academic_year_id = db.Column(db.Integer, db.ForeignKey('academic_years.id'), nullable=False)
    classroom_id = db.Column(db.Integer, db.ForeignKey('classrooms.id'), nullable=False)
    
    old_due = db.Column(db.Float, default=0.0)
    discount = db.Column(db.Float, default=0.0)
    
    fees = db.relationship('StudentFee', backref='session', lazy=True, cascade="all, delete-orphan")
    payments = db.relationship('Payment', backref='session', lazy=True, cascade="all, delete-orphan")
    attendance = db.relationship('StudentAttendance', backref='session', lazy=True, cascade="all, delete-orphan")
    grades = db.relationship('Grade', backref='session', lazy=True, cascade="all, delete-orphan")

    @hybrid_property
    def total_fee_payable(self):
        return (self.old_due or 0) + sum(f.amount for f in self.fees) - (self.discount or 0)

    @total_fee_payable.expression
    def total_fee_payable(cls):
        return (func.coalesce(cls.old_due, 0) + 
                select(func.coalesce(func.sum(StudentFee.amount), 0))
                .where(StudentFee.session_id == cls.id)
                .scalar_subquery() - 
                func.coalesce(cls.discount, 0))

    @hybrid_property
    def total_paid(self):
        return sum(p.amount for p in self.payments) if self.payments else 0.0

    @total_paid.expression
    def total_paid(cls):
        return select(func.coalesce(func.sum(Payment.amount), 0))\
               .where(Payment.session_id == cls.id)\
               .scalar_subquery()

    @hybrid_property
    def final_due(self):
        return self.total_fee_payable - self.total_paid

class FeeType(db.Model):
    __tablename__ = 'fee_types'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False) # Tuition, Bus, Comp, etc.
    description = db.Column(db.String(255))

class StudentFee(db.Model):
    __tablename__ = 'student_fees'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('student_sessions.id'), nullable=False)
    fee_type_id = db.Column(db.Integer, db.ForeignKey('fee_types.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False, default=0.0)
    
    fee_type = db.relationship('FeeType')

class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('student_sessions.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False, default=0.0)
    payment_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    payment_method = db.Column(db.String(50), default='Cash')
    transaction_ref = db.Column(db.String(100))
    remarks = db.Column(db.String(255))

    @property
    def payment_date(self):
        return self.payment_at.strftime("%Y-%m-%d") if self.payment_at else ""

class Admission(db.Model):
    __tablename__ = 'admissions'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), unique=True)
    
    adm_no = db.Column(db.String(50))
    pen_no = db.Column(db.String(50))
    date_of_adm = db.Column(db.Date)
    
    father_aadhar = db.Column(db.String(20))
    mother_aadhar = db.Column(db.String(20))
    nationality = db.Column(db.String(50))
    caste = db.Column(db.String(50))
    mother_tongue = db.Column(db.String(50))
    residence = db.Column(db.String(100))
    prev_school = db.Column(db.String(100))
    particulars_tc = db.Column(db.String(100))
    id_mark1 = db.Column(db.String(100))
    id_mark2 = db.Column(db.String(100))
    class_medium = db.Column(db.String(50))
    remarks = db.Column(db.Text)

# --- ERP MODULES ---

class StudentAttendance(db.Model):
    __tablename__ = 'student_attendance'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('student_sessions.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='Present') # Present, Absent, Late, Half-day

class Staff(db.Model):
    __tablename__ = 'staff'
    id = db.Column(db.Integer, primary_key=True)
    staff_id = db.Column(db.String(50), unique=True, index=True)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50))
    phone_no = db.Column(db.String(20))
    email = db.Column(db.String(100))
    address = db.Column(db.Text)
    joining_date = db.Column(db.Date)
    basic_salary = db.Column(db.Float, default=0.0)
    is_active = db.Column(db.Boolean, default=True)

class StaffAttendance(db.Model):
    __tablename__ = 'staff_attendance'
    id = db.Column(db.Integer, primary_key=True)
    staff_id = db.Column(db.Integer, db.ForeignKey('staff.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='Present')
    check_in = db.Column(db.DateTime)
    check_out = db.Column(db.DateTime)

class Subject(db.Model):
    __tablename__ = 'subjects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    code = db.Column(db.String(20))

class Exam(db.Model):
    __tablename__ = 'exams'
    id = db.Column(db.Integer, primary_key=True)
    academic_year_id = db.Column(db.Integer, db.ForeignKey('academic_years.id'), nullable=False)
    name = db.Column(db.String(50), nullable=False) # e.g., "Term 1", "Final Exam"
    date = db.Column(db.Date)

class Grade(db.Model):
    __tablename__ = 'grades'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('student_sessions.id'), nullable=False)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id'), nullable=False)
    marks_obtained = db.Column(db.Float)
    max_marks = db.Column(db.Float)
    grade_letter = db.Column(db.String(10))
