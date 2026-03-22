from app import app, db
from models import StudentSession, StudentFee, Payment
import math

def fix_nan_values():
    with app.app_context():
        print("Starting Database Audit for NaN values...")
        
        # Check StudentSession
        sessions = StudentSession.query.all()
        for s in sessions:
            if s.old_due is not None and math.isnan(s.old_due):
                print(f"Fixing NaN old_due for Session {s.id}")
                s.old_due = 0.0
            if s.discount is not None and math.isnan(s.discount):
                print(f"Fixing NaN discount for Session {s.id}")
                s.discount = 0.0
                
        # Check StudentFee
        fees = StudentFee.query.all()
        for f in fees:
            if f.amount is not None and math.isnan(f.amount):
                print(f"Fixing NaN amount for Fee {f.id}")
                f.amount = 0.0
                
        # Check Payment
        payments = Payment.query.all()
        for p in payments:
            if p.amount is not None and math.isnan(p.amount):
                print(f"Fixing NaN amount for Payment {p.id}")
                p.amount = 0.0
                
        db.session.commit()
        print("Database Audit Complete. No more NaN values in sensitive fields.")

if __name__ == "__main__":
    fix_nan_values()
