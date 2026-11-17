import { useEffect, useState } from "react";
import axios from "axios";
import db from "../db.json";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

const STORAGE_KEY = "student-manager-students";

const getLocalStudents = () => {
  const savedStudents = localStorage.getItem(STORAGE_KEY);
  return savedStudents ? JSON.parse(savedStudents) : db.students;
};

const saveLocalStudents = (students) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
};

function App() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [marks, setMarks] = useState("");
  const [editId, setEditId] = useState(null);
  const [usesLocalData, setUsesLocalData] = useState(false);

  const totalStudents = students.length;
  const averageMarks =
    totalStudents > 0
      ? Math.round(
          students.reduce((total, student) => total + Number(student.marks || 0), 0) /
            totalStudents
        )
      : 0;
  const topStudent = students.reduce(
    (highest, student) =>
      !highest || Number(student.marks) > Number(highest.marks) ? student : highest,
    null
  );

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data);
      setUsesLocalData(false);
    } catch {
      setStudents(getLocalStudents());
      setUsesLocalData(true);
    }
  };

  const resetForm = () => {
    setName("");
    setMarks("");
    setEditId(null);
  };

  const addStudent = async () => {
    if (!name.trim() || !marks) return alert("Name aur marks likho!");

    const student = {
      id: crypto.randomUUID?.() || String(Date.now()),
      name: name.trim(),
      marks: Number(marks),
    };

    if (usesLocalData) {
      const nextStudents = [...students, student];
      saveLocalStudents(nextStudents);
      setStudents(nextStudents);
    } else {
      await api.post("/students", student);
      loadStudents();
    }
    resetForm();
  };

  const deleteStudent = async (id) => {
    if (usesLocalData) {
      const nextStudents = students.filter((student) => student.id !== id);
      saveLocalStudents(nextStudents);
      setStudents(nextStudents);
    } else {
      await api.delete(`/students/${id}`);
      loadStudents();
    }
  };

  const startEdit = (student) => {
    setEditId(student.id);
    setName(student.name);
    setMarks(String(student.marks));
  };

  const updateStudent = async () => {
    if (!name.trim() || !marks) return alert("Name aur marks likho!");

    const updatedStudent = {
      id: editId,
      name: name.trim(),
      marks: Number(marks),
    };

    if (usesLocalData) {
      const nextStudents = students.map((student) =>
        student.id === editId ? updatedStudent : student
      );
      saveLocalStudents(nextStudents);
      setStudents(nextStudents);
    } else {
      await api.put(`/students/${editId}`, updatedStudent);
      loadStudents();
    }
    resetForm();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <a href="/" className="text-2xl font-bold text-blue-700">
            Student Manager
          </a>
          <ul className="flex flex-wrap gap-3 text-sm font-medium text-slate-600">
            <li>
              <a className="hover:text-blue-700" href="#students">
                Students
              </a>
            </li>
            <li>
              <a className="hover:text-blue-700" href="#summary">
                Summary
              </a>
            </li>
            <li>
              <a className="hover:text-blue-700" href="#contact">
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        <section className="bg-blue-700 text-white">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <article>
              <p className="mb-3 text-sm font-semibold uppercase text-blue-100">
                Smart class record
              </p>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
                Manage students, marks, and class progress in one clean front page.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-blue-50">
                Add new students, update marks, and quickly review the class list with a
                semantic HTML layout.
              </p>
            </article>

            <aside
              id="summary"
              className="grid gap-4 rounded-lg bg-white p-5 text-slate-900 shadow-xl"
              aria-label="Class summary"
            >
              <h2 className="text-xl font-semibold">Class Summary</h2>
              <dl className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200 p-4">
                  <dt className="text-sm text-slate-500">Students</dt>
                  <dd className="mt-1 text-3xl font-bold text-blue-700">{totalStudents}</dd>
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <dt className="text-sm text-slate-500">Average</dt>
                  <dd className="mt-1 text-3xl font-bold text-blue-700">{averageMarks}</dd>
                </div>
              </dl>
              <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                Top student: {topStudent ? `${topStudent.name} (${topStudent.marks})` : "No record yet"}
              </p>
            </aside>
          </div>
        </section>

        <section id="students" className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <header>
              <h2 className="text-2xl font-bold text-slate-900">
                {editId ? "Update Student" : "Add Student"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Fill the student name and marks, then save the record.
              </p>
            </header>

            <form
              className="mt-6 grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                editId ? updateStudent() : addStudent();
              }}
            >
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Student Name
                <input
                  type="text"
                  placeholder="Student Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Marks
                <input
                  type="number"
                  placeholder="Marks"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className={`rounded-lg px-5 py-3 font-semibold text-white transition ${
                    editId ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-700 hover:bg-blue-800"
                  }`}
                >
                  {editId ? "Update Student" : "Add Student"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {usesLocalData && (
              <p className="mt-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                Browser data mode is active. Changes are saved on this device.
              </p>
            )}
          </article>

          <section aria-labelledby="student-list-title" className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="student-list-title" className="text-2xl font-bold text-slate-900">
                  Students List
                </h2>
                <p className="mt-2 text-sm text-slate-500">Review, edit, or delete student records.</p>
              </div>
            </header>

            <div className="grid gap-3">
              {students.map((student) => (
                <article
                  key={student.id}
                  className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <header>
                    <h3 className="text-lg font-semibold text-slate-900">{student.name}</h3>
                    <p className="text-sm text-slate-500">
                      Marks: <span className="font-semibold text-blue-700">{student.marks}</span>
                    </p>
                  </header>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(student)}
                      className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-900 transition hover:bg-amber-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteStudent(student.id)}
                      className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white transition hover:bg-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>

      <footer id="contact" className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Student Manager front page made with semantic HTML tags.</p>
          <address className="not-italic">Class record dashboard</address>
        </div>
      </footer>
    </div>
  );
}

export default App;
