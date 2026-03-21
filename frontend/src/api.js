const API = "https://adarsha-backend-n0dn.onrender.com";
console.log("System pointing to Brain at:", API);

// Helper for authenticated requests
async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    ...options.headers,
  };
  // Only add Content-Type if body is not FormData
  if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Session expired. Please login again.");
  }
  return res;
}

// ------- Auth & Security -------

export async function login(username, password) {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (data.success && data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    localStorage.setItem("role", data.role);
    localStorage.setItem("can_collect_fees", data.can_collect_fees ? "true" : "false");
  }
  return data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  localStorage.removeItem("can_collect_fees");
  window.location.href = "/login";
}

export async function verifyPassword(password) {
  const res = await authFetch(`${API}/verify-password`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });
  return res.ok;
}

// ------- Staff & Promotion -------

export async function fetchTeachers() {
  const res = await authFetch(`${API}/admin/teachers`);
  if (!res.ok) throw new Error("Failed to fetch teachers");
  return await res.json();
}

export async function createTeacher(data) {
  const res = await authFetch(`${API}/admin/teachers`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function updateTeacher(tid, data) {
  const res = await authFetch(`${API}/admin/teachers/${tid}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function deleteTeacher(tid) {
  const res = await authFetch(`${API}/admin/teachers/${tid}`, {
    method: "DELETE",
  });
  return await res.json();
}

export async function fetchClassrooms() {
  const res = await authFetch(`${API}/config/classrooms`);
  if (!res.ok) throw new Error("Failed to fetch classrooms");
  return await res.json();
}

export async function promoteClass(data) {
  const res = await authFetch(`${API}/students/promote-class`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return await res.json();
}

// ------- Student/Fee Management -------

export async function fetchStudents() {
  const res = await authFetch(`${API}/students`);
  if (!res.ok) throw new Error("Failed to fetch students");
  return await res.json();
}

export async function downloadFeeCard(idno) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/students/${idno}/feecard`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error("Failed to generate fee card");
    
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `FeeCard_${idno}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  }
}

export async function addStudent(student) {
  const res = await authFetch(`${API}/students`, {
    method: "POST",
    body: JSON.stringify(student),
  });
  if (!res.ok) throw new Error("Failed to add student");
  return await res.json();
}

export async function editStudent(student) {
  const idno = student["ID.NO"];
  const res = await authFetch(`${API}/students/${idno}`, {
    method: "PUT",
    body: JSON.stringify(student),
  });
  if (!res.ok) throw new Error("Failed to update student");
  return await res.json();
}

export async function deleteStudent(idno) {
  const res = await authFetch(`${API}/students/${idno}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete student");
  return await res.json();
}

// Download all students as Excel
export async function downloadExcel() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/download/excel`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "all_students.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Download filtered students as Excel
export async function downloadFilteredExcel(filteredStudents) {
  const res = await authFetch(`${API}/download/filtered-excel`, {
    method: "POST",
    body: JSON.stringify({ students: filteredStudents }),
  });
  if (!res.ok) throw new Error("Failed to download filtered Excel");
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "filtered_students.xlsx");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function uploadStudents(formData) {
  const res = await authFetch(`${API}/upload/students`, {
      method: "POST",
      body: formData 
  });
  return await res.json();
}

// ------- Admissions -------

export async function fetchAdmissions(filters = {}) {
  let url = `${API}/admissions`;
  const params = new URLSearchParams();
  if (filters.year_id) params.append('year_id', filters.year_id);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);
  
  if (params.toString()) url += `?${params.toString()}`;

  const res = await authFetch(url);
  if (!res.ok) throw new Error("Failed to fetch admissions");
  return await res.json();
}

export async function downloadAdmissionsExcel(filters = {}) {
    const token = localStorage.getItem("token");
    let url = `${API}/download/admissions-excel`;
    const params = new URLSearchParams();
    if (filters.year_id) params.append('year_id', filters.year_id);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to download admissions Excel");
    const blob = await res.blob();
    const urlObj = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = urlObj;
    link.setAttribute("download", filters.start_date ? "recent_admissions.xlsx" : "yearly_admissions.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export async function addAdmission(admission) {
  const res = await authFetch(`${API}/admissions`, {
    method: "POST",
    body: JSON.stringify(admission),
  });
  if (!res.ok) throw new Error("Failed to add admission");
  return await res.json();
}

export async function downloadAdmissionPdf(idno) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/students/${idno}/admission-pdf`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error("Failed to generate admission PDF");
    
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Admission_${idno}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  }
}

// ------- Configuration & Settings -------

export async function fetchClassroomConfig() {
  const res = await authFetch(`${API}/config/classrooms`);
  if (!res.ok) throw new Error("Failed to fetch classroom config");
  return await res.json();
}

export async function updateClassroomFee(name, section, fee) {
  const res = await authFetch(`${API}/config/classrooms`, {
    method: "POST",
    body: JSON.stringify({ name, section, fee }),
  });
  return await res.json();
}

export async function fetchBusRoutes() {
  const res = await authFetch(`${API}/config/bus-routes`);
  if (!res.ok) throw new Error("Failed to fetch bus routes");
  return await res.json();
}

export async function saveBusRoute(location, monthly, yearly) {
  const res = await authFetch(`${API}/config/bus-routes`, {
    method: "POST",
    body: JSON.stringify({ location, monthly, yearly }),
  });
  return await res.json();
}

export async function deleteBusRoute(id) {
  const res = await authFetch(`${API}/config/bus-routes?id=${id}`, {
    method: "DELETE",
  });
  return await res.json();
}

export async function backupDatabase() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/backup/database`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error("Backup failed");
    
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `Full_School_Backup_${timestamp}.db`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Failed to download backup: " + err.message);
  }
}

export async function academicYearRollover(nextYearName) {
  const res = await authFetch(`${API}/academic-year/rollover`, {
    method: "POST",
    body: JSON.stringify({ nextYearName })
  });
  if (!res.ok) throw new Error("Rollover failed");
  return await res.json();
}

// ------- Audit Logs & Notifications -------

export async function fetchAuditLogs() {
  const res = await authFetch(`${API}/audit-logs`);
  if (!res.ok) throw new Error("Failed to fetch audit logs");
  return await res.json();
}

export async function fetchNotifications() {
  const res = await authFetch(`${API}/notifications`);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return await res.json();
}

export async function markNotificationRead(id) {
  const res = await authFetch(`${API}/notifications/${id}/read`, {
    method: "PUT",
  });
  if (!res.ok) throw new Error("Failed to mark notification as read");
  return await res.json();
}

export async function fetchStats() {
  const res = await authFetch(`${API}/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return await res.json();
}

// ------- Payments -------

export async function downloadPaymentsExcel(startDate, endDate) {
  let url = `${API}/download/payment_details`;
  if (startDate && endDate) {
    url += `?start=${startDate}&end=${endDate}`;
  }
  
  const token = localStorage.getItem("token");
  const res = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}` }
  });
  const blob = await res.blob();
  const urlObj = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = urlObj;
  link.setAttribute("download", "payment_details.xlsx");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
