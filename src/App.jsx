import { useEffect, useState } from "react";

const STORAGE_KEY = "student-manager-students";

const defaultStudents = [
  { id: 1, name: "Ali", marks: 85 },
  { id: 2, name: "Ahmed", marks: 92 },
  { id: 3, name: "Sara", marks: 78 },
];

function getLocalStudents() {
  const savedStudents = localStorage.getItem(STORAGE_KEY);

  return savedStudents ? JSON.parse(savedStudents) : defaultStudents;
}

function App() {
  const [students, setStudents] = useState(getLocalStudents);
  const [name, setName] = useState("");
  const [marks, setMarks] = useState("");
  const [editId, setEditId] = useState(null);

  // Save students whenever the list changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  }, [students]);

  // Summary calculations
  const totalStudents = students.length;

  const averageMarks =
    totalStudents > 0
      ? Math.round(
          students.reduce(
            (total, student) => total + Number(student.marks || 0),
            0,
          ) / totalStudents,
        )
      : 0;

  const topStudent = students.reduce(
    (highest, student) =>
      !highest || Number(student.marks) > Number(highest.marks)
        ? student
        : highest,
    null,
  );

  // Reset form
  const resetForm = () => {
    setName("");
    setMarks("");
    setEditId(null);
  };

  // Add student
  const addStudent = () => {
    if (!name.trim() || marks === "") {
      return alert("Name aur marks likho!");
    }

    const student = {
      id: crypto.randomUUID(),
      name: name.trim(),
      marks: Number(marks),
    };

    setStudents([...students, student]);
    resetForm();
  };

  // Delete student
  const deleteStudent = (id) => {
    const nextStudents = students.filter((student) => student.id !== id);

    setStudents(nextStudents);
  };

  // Start editing
  const startEdit = (student) => {
    setEditId(student.id);
    setName(student.name);
    setMarks(String(student.marks));
  };

  // Update student
  const updateStudent = () => {
    if (!name.trim() || marks === "") {
      return alert("Name aur marks likho!");
    }

    const updatedStudents = students.map((student) =>
      student.id === editId
        ? {
            ...student,
            name: name.trim(),
            marks: Number(marks),
          }
        : student,
    );

    setStudents(updatedStudents);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <a href="/" className="text-2xl font-bold text-blue-700">
            Student Manager
          </a>

          <ul className="flex flex-wrap gap-3 text-sm font-medium text-slate-600">
            <li>
              <a href="#students">Students</a>
            </li>
            <li>
              <a href="#summary">Summary</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        {/* Hero and Summary */}
        <section className="bg-blue-700 text-white">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <article>
              <p className="mb-3 text-sm font-semibold uppercase text-blue-100">
                Smart Class Record
              </p>

              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                Manage students, marks, and class progress.
              </h1>

              <p className="mt-5 text-base leading-7 text-blue-50">
                Add students, update marks, and review class records.
              </p>
            </article>

            <aside
              id="summary"
              className="grid gap-4 rounded-lg bg-white p-5 text-slate-900 shadow-xl"
            >
              <h2 className="text-xl font-semibold">Class Summary</h2>

              <dl className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <dt className="text-sm text-slate-500">Students</dt>
                  <dd className="mt-1 text-3xl font-bold text-blue-700">
                    {totalStudents}
                  </dd>
                </div>

                <div className="rounded-lg border p-4">
                  <dt className="text-sm text-slate-500">Average</dt>
                  <dd className="mt-1 text-3xl font-bold text-blue-700">
                    {averageMarks}
                  </dd>
                </div>
              </dl>

              <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                Top student:{" "}
                {topStudent
                  ? `${topStudent.name} (${topStudent.marks})`
                  : "No record yet"}
              </p>
            </aside>
          </div>
        </section>

        {/* Student Form and List */}
        <section
          id="students"
          className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[0.9fr_1.1fr]"
        >
          {/* Form */}
          <article className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold">
              {editId ? "Update Student" : "Add Student"}
            </h2>

            <form
              className="mt-6 grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                editId ? updateStudent() : addStudent();
              }}
            >
              <label className="grid gap-2 text-sm font-medium">
                Student Name
                <input
                  type="text"
                  placeholder="Student Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border px-4 py-3"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Marks
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Marks"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-full rounded-lg border px-4 py-3"
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white"
                >
                  {editId ? "Update Student" : "Add Student"}
                </button>

                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border px-5 py-3"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </article>

          {/* Students List */}
          <section className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold">Students List</h2>

            <div className="grid gap-3">
              {students.length === 0 && (
                <p className="text-slate-500">
                  No students found. Add your first student!
                </p>
              )}

              {students.map((student) => (
                <article
                  key={student.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <header>
                    <h3 className="text-lg font-semibold">{student.name}</h3>

                    <p className="text-sm text-slate-500">
                      Marks: {student.marks}
                    </p>
                  </header>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(student)}
                      className="rounded-lg bg-amber-400 px-4 py-2 font-semibold"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteStudent(student.id)}
                      className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white"
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

      {/* Footer */}
      <footer id="contact" className="border-t bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-500">
          <p>Student Manager - React Frontend Project</p>
          <address className="not-italic">Class Record Dashboard</address>
        </div>
      </footer>
    </div>
  );
}

export default App;
