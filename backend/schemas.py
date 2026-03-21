from marshmallow import fields, post_dump
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from models import (
    User, Student, Payment, Admission, AuditLog, Notification,
    AcademicYear, ClassRoom, StudentSession, FeeType, StudentFee,
    StudentAttendance, Staff, StaffAttendance, Subject, Exam, Grade
)

class UserSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        exclude = ("password_hash",)

class AuditLogSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = AuditLog
        load_instance = True
        include_fk = True
    
    user = fields.Nested(UserSchema, dump_only=True)
    timestamp = fields.DateTime(dump_only=True)

class NotificationSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Notification
        load_instance = True
    
    created_at = fields.DateTime(dump_only=True)

class AcademicYearSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = AcademicYear
        load_instance = True

class ClassRoomSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = ClassRoom
        load_instance = True

class FeeTypeSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = FeeType
        load_instance = True

class StudentFeeSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = StudentFee
        load_instance = True
    
    fee_type = fields.Nested(FeeTypeSchema, dump_only=True)

class PaymentSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Payment
        load_instance = True
        include_fk = True
    
    # Explicitly include properties
    id = fields.Int(dump_only=True)
    amount = fields.Float(dump_only=True)
    payment_method = fields.Str(dump_only=True)
    payment_date = fields.Method("get_payment_date", dump_only=True)

    def get_payment_date(self, obj):
        return obj.payment_at.strftime('%d-%m-%Y') if obj.payment_at else None

class StudentSessionSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = StudentSession
        load_instance = True
        include_fk = True
    
    classroom = fields.Nested(ClassRoomSchema, dump_only=True)
    academic_year = fields.Nested(AcademicYearSchema, dump_only=True)
    fees = fields.Nested(StudentFeeSchema, many=True, dump_only=True)
    payments = fields.Nested(PaymentSchema, many=True, dump_only=True)
    
    # Map hybrid properties explicitly
    total_fee_payable = fields.Float(attribute="total_fee_payable", dump_only=True)
    total_paid = fields.Float(attribute="total_paid", dump_only=True)
    final_due = fields.Float(attribute="final_due", dump_only=True)

class StudentAttendanceSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = StudentAttendance
        load_instance = True

class GradeSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Grade
        load_instance = True

class AdmissionSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Admission
        load_instance = True
        include_fk = True

class StudentSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Student
        load_instance = True
        include_fk = True

    admission = fields.Nested(AdmissionSchema, dump_only=True)
    # We'll use a method to get the 'active' or 'latest' session for simple listing
    active_session = fields.Method("get_active_session", dump_only=True)

    def get_active_session(self, obj):
        # Find active session or latest session
        session = next((s for s in obj.sessions if s.academic_year.is_active), None)
        if not session and obj.sessions:
            session = sorted(obj.sessions, key=lambda x: x.academic_year.name, reverse=True)[0]
        
        if session:
            return StudentSessionSchema().dump(session)
        return None

    @post_dump
    def add_legacy_keys(self, data, many, **kwargs):
        # Map new SQL names back to what the Frontend expects for backward compatibility
        session = data.get("active_session")
        if session:
            data["CLASS"] = session.get("classroom", {}).get("name")
            data["old_due"] = session.get("old_due")
            data["total_fee"] = session.get("total_fee_payable")
            data["total_paid"] = session.get("total_paid")
            data["final_due"] = session.get("final_due")
            data["final due"] = session.get("final_due") # Frontend expects "final due"
            
            # Map specific fees back if they exist in StudentFee
            fees = session.get("fees", [])
            fee_map = {
                "sc.fee": ["School Fee", "sc_fee", "Tuition Fee"],
                "comp": ["Comp Fee", "comp_fee", "Computer Fee"],
                "ex.fee": ["Ex Fee", "ex_fee", "Examination Fee"],
                "bus fee": ["Bus Fee", "bus_fee", "Transport Fee"]
            }
            for legacy_key, possible_names in fee_map.items():
                fee_val = next((f["amount"] for f in fees if f["fee_type"]["name"] in possible_names), 0.0)
                data[legacy_key] = fee_val
            
            # Additional legacy keys
            data["total"] = data.get("total_fee")
            data["total pay"] = data.get("total_paid")
            data["payments"] = session.get("payments", [])

        data["ID.NO"] = data.get("id_no")
        data["NAME"] = data.get("name")
        data["VILLAGE"] = data.get("village")
        data["F.NAME"] = data.get("father_name")
        data["PH.NO"] = data.get("phone_no")
        data["bus route"] = data.get("bus_route")
        data["Hosteler/Dayscholar"] = data.get("hostel_day")
            
        return data

# ERP Module Schemas
class StaffSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Staff
        load_instance = True

class StaffAttendanceSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = StaffAttendance
        load_instance = True
    staff = fields.Nested(StaffSchema, dump_only=True)

class SubjectSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Subject
        load_instance = True

class ExamSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Exam
        load_instance = True
