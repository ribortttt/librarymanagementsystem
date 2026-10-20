const SESSION_KEY = "lms-session";
const STORAGE_KEY = "lms-library";
const SETTINGS_KEY = "lms-settings";
const PROFILE_KEY = "lms-profile";
const MAX_LOANS = 5;
const LOAN_DAYS = 14;
const DEFAULT_CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Multimedia",
  "Academic Journals",
];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

const isLoggedIn = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "true";
  } catch (error) {
    return false;
  }
};

const onLoginPage = Boolean($(".form-login"));
const onRegisterPage = Boolean($(".form-registermember"));

if (!onLoginPage && !onRegisterPage && !isLoggedIn()) {
  window.location.replace("index.html");
} else if (onLoginPage && isLoggedIn()) {
  window.location.replace("home.html");
}

const logout = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (error) {}
  window.location.replace("index.html");
};

const formatISO = (date) =>
  date.getFullYear() +
  "-" +
  String(date.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(date.getDate()).padStart(2, "0");

const todayISO = () => formatISO(new Date());

const addDays = (iso, days) => {
  const [year, month, day] = iso.split("-").map(Number);
  return formatISO(new Date(year, month - 1, day + days));
};

const daysBetween = (fromISO, toISO) => {
  const a = new Date(fromISO + "T00:00:00");
  const b = new Date(toISO + "T00:00:00");
  return Math.round((b - a) / 86400000);
};

const loadSettings = () => {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  } catch (error) {
    return {};
  }
};

let settings = loadSettings();

const fmtDate = (iso) => {
  if (!iso) return "-";
  const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  const pad = (n) => String(n).padStart(2, "0");
  const yy = pad(y % 100);
  if (settings.dateFormat === "MM/DD/YY") return `${pad(m)}/${pad(d)}/${yy}`;
  if (settings.dateFormat === "DD/MM/YY") return `${pad(d)}/${pad(m)}/${yy}`;
  if (settings.dateFormat === "YY/MM/DD") return `${yy}/${pad(m)}/${pad(d)}`;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ago = (iso) => {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (Number.isNaN(seconds)) return "";
  if (seconds < 60) return "just now";
  if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
  if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago";
  if (seconds < 604800) return Math.floor(seconds / 86400) + "d ago";
  return fmtDate(String(iso).slice(0, 10));
};

const nextId = (prefix, items) => {
  const highest = items.reduce((max, item) => {
    const number = parseInt(String(item.id).split("-").pop(), 10);
    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);
  return prefix + "-" + String(highest + 1).padStart(3, "0");
};

const pad3 = (n) => String(n).padStart(3, "0");
const mkBook = (
  n,
  title,
  author,
  category,
  quantity,
  publisher = "",
  year = "",
) => ({
  id: "B-" + pad3(n),
  title,
  author,
  category,
  isbn: "",
  publisher,
  edition: "",
  year,
  description: "",
  quantity,
});
const mkMember = (n, name, role, status, joined, department = "") => ({
  id: "PCC-3028-" + pad3(n),
  name,
  email: name.replace(/\s/g, "").toLowerCase() + "@pcc.edu.ph",
  contact: "",
  role,
  yearLevel: "",
  department,
  status,
  joined,
});
const mkLoan = (
  n,
  bookN,
  memberN,
  borrowedDate,
  dueDate,
  returnedDate = null,
) => ({
  id: "BR-" + pad3(n),
  bookId: "B-" + pad3(bookN),
  memberId: "PCC-3028-" + pad3(memberN),
  borrowedDate,
  dueDate,
  returnedDate,
});

const SEED = {
  books: [
    mkBook(1, "Whiskey", "T. Kira Madden", "Fiction", 3),
    mkBook(2, "Illuminae", "Jay Kristoff", "Multimedia", 2),
    mkBook(3, "The Great Gatsby", "F. Scott Fitzgerald", "Fiction", 4),
    mkBook(4, "Becoming", "Michelle Obama", "Non-Fiction", 1),
    mkBook(5, "A Far-Flung Life", "M.L. Stedman", "Fiction", 2),
    mkBook(6, "The Lightning Thief", "Rick Riordan", "Fiction", 3),
    mkBook(
      7,
      "Clean Code",
      "Robert C. Martin",
      "Academic Journals",
      2,
      "Prentice Hall",
      "2008",
    ),
    mkBook(8, "The Alchemist", "Paulo Coelho", "Fiction", 2),
    mkBook(9, "Sapiens", "Yuval Noah Harari", "Non-Fiction", 2),
    mkBook(
      10,
      "Journal of Library Science",
      "Various Authors",
      "Academic Journals",
      1,
    ),
    mkBook(11, "Game On", "Vanessa Allen", "Fiction", 1),
    mkBook(12, "The Enlightening Truth", "R. Nivian", "Multimedia", 2),
  ],
  members: [
    mkMember(1, "Maria Santos", "Student", "Active", "2026-09-06"),
    mkMember(2, "John Reyes", "Faculty", "Active", "2026-09-14"),
    mkMember(3, "Angela Cruz", "Student", "Pending", "2026-09-24"),
    mkMember(4, "Mark Dela Rosa", "Staff", "Active", "2026-09-22"),
    mkMember(5, "Sofia Mendoza", "Student", "Suspended", "2026-09-21"),
    mkMember(6, "Carlo Garcia", "Faculty", "Active", "2026-09-16"),
    mkMember(7, "Elena Gutierrez", "Student", "Active", "2026-10-19"),
  ],
  borrowings: [
    mkLoan(1, 1, 1, "2026-09-06", "2026-09-20", "2026-09-18"),
    mkLoan(2, 2, 2, "2026-09-06", "2026-09-20", "2026-09-20"),
    mkLoan(3, 3, 6, "2026-09-06", "2026-09-20", "2026-09-25"),
    mkLoan(4, 4, 4, "2026-10-10", "2026-10-24"),
    mkLoan(5, 5, 1, "2026-09-15", "2026-09-29", "2026-09-28"),
    mkLoan(6, 6, 2, "2026-09-20", "2026-10-04"),
    mkLoan(7, 8, 7, "2026-10-15", "2026-10-29"),
    mkLoan(8, 7, 6, "2026-10-05", "2026-10-19"),
    mkLoan(9, 11, 4, "2026-10-01", "2026-10-15"),
    mkLoan(10, 9, 1, "2026-09-08", "2026-09-22", "2026-09-21"),
  ],
  log: [
    {
      type: "member",
      title: "Member Registered",
      sub: "Elena Gutierrez",
      at: "2026-10-19T09:00:00",
    },
    {
      type: "borrow",
      title: "Book Borrowed",
      sub: "The Alchemist",
      at: "2026-10-15T10:30:00",
    },
    {
      type: "borrow",
      title: "Book Borrowed",
      sub: "Becoming",
      at: "2026-10-10T14:00:00",
    },
    {
      type: "book",
      title: "New Book Added",
      sub: "Game On",
      at: "2026-10-01T08:15:00",
    },
    {
      type: "return",
      title: "Book Returned",
      sub: "Sapiens",
      at: "2026-09-21T16:45:00",
    },
  ],
};


const createLibrary = () => {
  const empty = () => ({ books: [], members: [], borrowings: [], log: [] });
  let data = empty();

  const normalize = (raw) => ({
    books: Array.isArray(raw.books) ? raw.books : [],
    members: Array.isArray(raw.members) ? raw.members : [],
    borrowings: Array.isArray(raw.borrowings) ? raw.borrowings : [],
    log: Array.isArray(raw.log) ? raw.log : [],
  });

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      return false;
    }
  };

  const ready = (async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        data = normalize(JSON.parse(stored));
        return;
      }
    } catch (error) {
      data = empty();
    }

    try {
      const response = await fetch("lms.json");
      if (response.ok) {
        const loaded = normalize(await response.json());
        if (loaded.books.length || loaded.members.length) data = loaded;
      }
    } catch (error) {
      /* fetch fails on file:// - fall back to the starter data below */
    }

    if (!data.books.length && !data.members.length) {
      data = normalize(JSON.parse(JSON.stringify(SEED)));
    }
    save();
  })();

  const logActivity = (type, title, sub) => {
    data.log.unshift({ type, title, sub, at: new Date().toISOString() });
    data.log = data.log.slice(0, 50);
  };

  const copiesOut = (bookId) =>
    data.borrowings.filter((r) => r.bookId === bookId && !r.returnedDate)
      .length;

  const describeBook = (book) => {
    const quantity = Number(book.quantity) || 0;
    const borrowed = copiesOut(book.id);
    const available = Math.max(0, quantity - borrowed);
    return {
      ...book,
      quantity,
      borrowed,
      available,
      status: available > 0 ? "Available" : "Checked Out",
    };
  };

  const recordStatus = (record) => {
    if (record.returnedDate) return "Returned";
    return record.dueDate < todayISO() ? "Overdue" : "Borrowed";
  };

  const describeRecord = (record) => {
    const book = data.books.find((b) => b.id === record.bookId);
    const member = data.members.find((m) => m.id === record.memberId);
    return {
      ...record,
      title: book ? book.title : "Unknown book",
      cover: book ? book.cover : "",
      member: member ? member.name : "Unknown member",
      status: recordStatus(record),
    };
  };

  const listBooks = () => data.books.map(describeBook);
  const listBorrowings = () => data.borrowings.map(describeRecord);
  const listMembers = () => data.members.map((m) => ({ ...m }));
  const getBook = (id) => {
    const b = data.books.find((x) => x.id === id);
    return b ? describeBook(b) : null;
  };
  const getMember = (id) => data.members.find((m) => m.id === id) || null;
  const memberLoans = (id) =>
    listBorrowings().filter(
      (r) => r.memberId === id && r.status !== "Returned",
    );
  const overdue = () => listBorrowings().filter((r) => r.status === "Overdue");

  const uniqueValues = (key) =>
    [...new Set(data.books.map((b) => b[key]).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    );

  const search = (query = "", filters = {}) => {
    const text = String(query).trim().toLowerCase();
    return listBooks().filter((book) => {
      const matchesText =
        !text ||
        [book.title, book.author, book.category].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(text),
        );
      const matchesAuthor =
        !filters.author ||
        String(book.author).toLowerCase() ===
          String(filters.author).toLowerCase();
      const matchesCategory =
        !filters.category ||
        String(book.category).toLowerCase() ===
          String(filters.category).toLowerCase();
      const matchesAvailability = !filters.availableOnly || book.available > 0;
      return (
        matchesText && matchesAuthor && matchesCategory && matchesAvailability
      );
    });
  };

  const addBook = (fields) => {
    const title = String(fields.title || "").trim();
    const author = String(fields.author || "").trim();
    const category = String(fields.category || "").trim();
    const rawQuantity = String(fields.quantity || "").trim();
    const quantity = rawQuantity ? parseInt(rawQuantity, 10) : 1;

    if (!title || !author || !category)
      return { ok: false, error: "Title, author and category are required." };
    if (Number.isNaN(quantity) || quantity < 1)
      return { ok: false, error: "Quantity must be 1 or more." };

    const existing = data.books.find(
      (b) =>
        b.title.toLowerCase() === title.toLowerCase() &&
        b.author.toLowerCase() === author.toLowerCase(),
    );

    if (existing) {
      existing.quantity = (Number(existing.quantity) || 0) + quantity;
      logActivity("book", "Copies Added", existing.title);
      const saved = save();
      return { ok: true, merged: true, saved, book: describeBook(existing) };
    }

    const book = {
      id: nextId("B", data.books),
      title,
      author,
      category,
      isbn: String(fields.isbn || "").trim(),
      publisher: String(fields.publisher || "").trim(),
      edition: String(fields.edition || "").trim(),
      year: String(fields.year || "").trim(),
      description: String(fields.description || "").trim(),
      cover: fields.cover || "",
      quantity,
    };

    data.books.push(book);
    logActivity("book", "New Book Added", title);
    const saved = save();
    return { ok: true, merged: false, saved, book: describeBook(book) };
  };

  const removeBook = (id) => {
    const book = data.books.find((b) => b.id === id);
    if (!book) return { ok: false, error: "Book not found." };
    if (copiesOut(id) > 0)
      return {
        ok: false,
        error: "This book is currently borrowed. Return it before removing it.",
      };
    data.books = data.books.filter((b) => b.id !== id);
    save();
    return { ok: true, book };
  };

  const addMember = (fields) => {
    const name = String(fields.name || "").trim();
    const email = String(fields.email || "")
      .trim()
      .toLowerCase();
    const suppliedId = String(fields.studentId || "").trim();

    if (!name || !email)
      return { ok: false, error: "Name and email are required." };
    if (data.members.some((m) => m.email.toLowerCase() === email))
      return { ok: false, error: "A member with this email already exists." };
    if (
      suppliedId &&
      data.members.some((m) => m.id.toLowerCase() === suppliedId.toLowerCase())
    ) {
      return {
        ok: false,
        error: "That student or employee ID is already registered.",
      };
    }

    const status = String(fields.status || "Active").trim();
    const member = {
      id: suppliedId || nextId("PCC-3028", data.members),
      name,
      email,
      contact: String(fields.contact || "").trim(),
      role: String(fields.role || "Student").trim(),
      yearLevel: String(fields.yearLevel || "").trim(),
      department: String(fields.department || "").trim(),
      status: status === "Inactive" ? "Pending" : status,
      photo: fields.photo || "",
      joined: todayISO(),
    };

    data.members.push(member);
    logActivity("member", "Member Registered", name);
    const saved = save();
    return { ok: true, saved, member };
  };

  const updateMember = (id, fields) => {
    const member = getMember(id);
    if (!member) return { ok: false, error: "Member not found." };
    const name = String(fields.name || "").trim();
    const email = String(fields.email || "")
      .trim()
      .toLowerCase();
    if (!name || !email)
      return { ok: false, error: "Name and email are required." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return { ok: false, error: "Please enter a valid email address." };
    if (
      data.members.some((m) => m.id !== id && m.email.toLowerCase() === email)
    ) {
      return { ok: false, error: "Another member already uses this email." };
    }
    Object.assign(member, {
      name,
      email,
      contact: String(fields.contact || "").trim(),
      role: String(fields.role || member.role).trim(),
      department: String(fields.department || "").trim(),
      yearLevel: String(fields.yearLevel || "").trim(),
    });
    save();
    return { ok: true, member };
  };

  const setMemberStatus = (id, status) => {
    const member = getMember(id);
    if (!member) return { ok: false, error: "Member not found." };
    member.status = status;
    save();
    return { ok: true, member };
  };

  const borrowBook = (bookId, memberId, days = LOAN_DAYS) => {
    const book = data.books.find((b) => b.id === bookId);
    const member = getMember(memberId);

    if (!book) return { ok: false, error: "Book not found." };
    if (!member) return { ok: false, error: "Member not found." };
    if (member.status !== "Active")
      return {
        ok: false,
        error:
          member.name +
          " is " +
          member.status.toLowerCase() +
          ". Only active members can borrow books.",
      };
    if (describeBook(book).available < 1)
      return { ok: false, error: "No copies of this book are available." };

    const loans = memberLoans(memberId);
    if (loans.some((r) => r.bookId === bookId))
      return { ok: false, error: "This member already has this book." };
    if (loans.some((r) => r.status === "Overdue"))
      return {
        ok: false,
        error: member.name + " has an overdue book. It must be returned first.",
      };
    if (loans.length >= MAX_LOANS)
      return {
        ok: false,
        error:
          member.name + " already has " + MAX_LOANS + " books (the limit).",
      };

    const borrowedDate = todayISO();
    const record = {
      id: nextId("BR", data.borrowings),
      bookId,
      memberId,
      borrowedDate,
      dueDate: addDays(borrowedDate, days),
      returnedDate: null,
    };

    data.borrowings.push(record);
    logActivity("borrow", "Book Borrowed", book.title);
    save();
    return { ok: true, record: describeRecord(record) };
  };

  const returnBook = (recordId) => {
    const record = data.borrowings.find((r) => r.id === recordId);
    if (!record) return { ok: false, error: "Borrowing record not found." };
    if (record.returnedDate)
      return { ok: false, error: "This book was already returned." };

    record.returnedDate = todayISO();
    const described = describeRecord(record);
    logActivity("return", "Book Returned", described.title);
    save();
    return {
      ok: true,
      late: record.returnedDate > record.dueDate,
      record: described,
    };
  };

  const stats = () => {
    const books = listBooks();
    const month = todayISO().slice(0, 7);
    return {
      titles: books.length,
      copies: books.reduce((s, b) => s + b.quantity, 0),
      available: books.reduce((s, b) => s + b.available, 0),
      borrowed: books.reduce((s, b) => s + b.borrowed, 0),
      overdue: overdue().length,
      members: data.members.length,
      activeMembers: data.members.filter((m) => m.status === "Active").length,
      pendingMembers: data.members.filter((m) => m.status === "Pending").length,
      suspendedMembers: data.members.filter((m) => m.status === "Suspended")
        .length,
      borrowedThisMonth: data.borrowings.filter((r) =>
        String(r.borrowedDate).startsWith(month),
      ).length,
      totalBorrowings: data.borrowings.length,
      returned: data.borrowings.filter((r) => r.returnedDate).length,
    };
  };

  const exportData = () => JSON.stringify(data, null, 2);

  const importData = (raw) => {
    if (
      !raw ||
      !Array.isArray(raw.books) ||
      !Array.isArray(raw.members) ||
      !Array.isArray(raw.borrowings)
    ) {
      return { ok: false, error: "That file is not a valid library backup." };
    }
    data = normalize(raw);
    save();
    return { ok: true };
  };

  const reset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
    }
    window.location.reload();
  };

  return {
    ready,
    listBooks,
    getBook,
    search,
    authors: () => uniqueValues("author"),
    categories: () => uniqueValues("category"),
    addBook,
    removeBook,
    listMembers,
    getMember,
    addMember,
    updateMember,
    setMemberStatus,
    memberLoans,
    borrowBook,
    returnBook,
    listBorrowings,
    overdue,
    stats,
    activity: () => data.log,
    exportData,
    importData,
    reset,
  };
};

const library = createLibrary();
window.LMS = library;

const injectStyles = () => {
  const style = document.createElement("style");
  style.textContent = `
    .lms-overlay{position:fixed;inset:0;background:rgba(25,12,12,.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px}
    .lms-dialog{background:#fff;color:#222;border-radius:12px;width:min(480px,100%);max-height:90vh;overflow:auto;padding:24px;box-shadow:0 20px 50px rgba(0,0,0,.3);font:inherit}
    .lms-dialog h2{margin:0 0 4px;font-size:20px}
    .lms-sub{margin:0 0 12px;color:#666;font-size:14px}
    .lms-dialog label{display:block;font-size:13px;font-weight:600;margin:12px 0 4px}
    .lms-dialog input,.lms-dialog select{width:100%;padding:10px 12px;border:1px solid #cfcfcf;border-radius:8px;font:inherit;box-sizing:border-box;background:#fff}
    .lms-dialog dl{display:grid;grid-template-columns:120px 1fr;gap:8px 12px;margin:12px 0}
    .lms-dialog dt{color:#666}.lms-dialog dd{margin:0;font-weight:600;word-break:break-word}
    .lms-dialog ul{list-style:none;margin:8px 0;padding:0}
    .lms-dialog li{padding:8px 0;border-bottom:1px solid #eee;font-size:14px}
    .lms-dialog li small{display:block;color:#666}
    .lms-error{color:#b3261e;font-size:13px;min-height:18px;margin:10px 0 0}
    .lms-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:14px}
    .lms-btn{border:0;border-radius:8px;padding:10px 16px;font:inherit;font-weight:600;cursor:pointer;background:#ececec;color:#222}
    .lms-btn.primary{background:#7a1f2b;color:#fff}.lms-btn.danger{background:#b3261e;color:#fff}
    .lms-btn.small{padding:6px 10px;font-size:13px}
    .lms-btn:disabled,.page-members:disabled,.page-returning:disabled,.page-borrowing:disabled,.page-availability:disabled{opacity:.45;cursor:not-allowed}
    .lms-row-actions{display:flex;gap:6px;align-items:center}
    .lms-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:#222;color:#fff;padding:12px 18px;border-radius:10px;z-index:1100;max-width:90vw;font-size:14px}
    .lms-toast.error{background:#b3261e}
    .lms-menu{position:absolute;right:0;top:calc(100% + 6px);background:#fff;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.2);min-width:150px;overflow:hidden;z-index:900}
    .lms-menu[hidden]{display:none}
    .lms-menu a,.lms-menu button{display:block;width:100%;padding:11px 16px;border:0;background:none;text-align:left;font:inherit;color:#222;text-decoration:none;cursor:pointer}
    .lms-menu a:hover,.lms-menu button:hover{background:#f5eeee}
    .status-borrowing.overdue-borrowing{background:#fde7e5;color:#b3261e}
    .status-returning.late-returning{background:#fff1dc;color:#a15c00}
    .lms-add-btn{display:inline-flex;gap:8px;align-items:center}
  `;
  document.head.appendChild(style);
};

const toast = (text, type = "") => {
  const el = document.createElement("div");
  el.className = "lms-toast" + (type ? " " + type : "");
  el.setAttribute("role", "status");
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
};

const openDialog = ({ title, sub = "", body = "", buttons = [], onSubmit }) => {
  const previous = document.activeElement;
  const overlay = document.createElement("div");
  overlay.className = "lms-overlay";
  overlay.innerHTML =
    '<form class="lms-dialog" role="dialog" aria-modal="true" novalidate>' +
    "<h2>" +
    esc(title) +
    "</h2>" +
    (sub ? '<p class="lms-sub">' + esc(sub) + "</p>" : "") +
    body +
    '<p class="lms-error" role="alert"></p><div class="lms-actions"></div></form>';

  const form = $("form", overlay);
  const actions = $(".lms-actions", overlay);
  const errorBox = $(".lms-error", overlay);

  const onKey = (event) => {
    if (event.key === "Escape") api.close();
  };

  const api = {
    el: form,
    error: (text) => {
      errorBox.textContent = text;
    },
    value: (name) =>
      form.elements[name] ? form.elements[name].value.trim() : "",
    close: () => {
      overlay.remove();
      document.removeEventListener("keydown", onKey);
      if (previous && previous.focus) previous.focus();
    },
  };

  buttons.forEach((button) => {
    const el = document.createElement("button");
    el.type = button.submit ? "submit" : "button";
    el.className = "lms-btn " + (button.kind || "");
    el.textContent = button.label;
    if (!button.submit)
      el.addEventListener("click", () =>
        button.onClick ? button.onClick(api) : api.close(),
      );
    actions.appendChild(el);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (onSubmit) onSubmit(api);
  });
  form.addEventListener("input", () => api.error(""));
  overlay.addEventListener("mousedown", (event) => {
    if (event.target === overlay) api.close();
  });
  document.addEventListener("keydown", onKey);
  document.body.appendChild(overlay);
  const first =
    $("input, select", form) || $(".lms-btn.primary, .lms-btn.danger", form);
  if (first) first.focus();
  return api;
};

const showDetails = (title, pairs, buttons = [{ label: "Close" }], sub = "") =>
  openDialog({
    title,
    sub,
    buttons,
    body:
      "<dl>" +
      pairs
        .map(
          ([k, v]) => "<dt>" + esc(k) + "</dt><dd>" + esc(v || "-") + "</dd>",
        )
        .join("") +
      "</dl>",
  });

const confirmDialog = (title, text, label, onYes) =>
  openDialog({
    title,
    sub: text,
    buttons: [{ label: "Cancel" }, { label, kind: "danger", submit: true }],
    onSubmit: (dialog) => {
      dialog.close();
      onYes();
    },
  });

const showModal = (text, onClose) => {
  const previous = document.activeElement;
  const overlay = document.createElement("div");
  overlay.className = "overlay-modal";
  overlay.innerHTML =
    '<div class="dialog-modal" role="alertdialog" aria-modal="true" aria-labelledby="title-modal">' +
    '<h2 id="title-modal"></h2><button type="button" class="confirm-modal">Confirm</button></div>';
  overlay.querySelector("h2").textContent = text;

  const onKey = (event) => {
    if (event.key === "Escape") close();
  };
  const close = () => {
    overlay.remove();
    document.removeEventListener("keydown", onKey);
    if (previous && previous.focus) previous.focus();
    if (onClose) onClose();
  };

  overlay.querySelector(".confirm-modal").addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  document.addEventListener("keydown", onKey);
  document.body.appendChild(overlay);
  overlay.querySelector(".confirm-modal").focus();
};

const COVERS = ["one", "two", "three", "four", "five", "six", "seven"];
const coverHTML = (book, tag = "div") => {
  const n =
    parseInt(
      String(book.id || "")
        .split("-")
        .pop(),
      10,
    ) || 0;
  const inner = book.cover
    ? '<img src="' +
      esc(book.cover) +
      '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">'
    : '<i class="fa-solid fa-book"></i>';
  return (
    "<" +
    tag +
    ' class="cover cover-' +
    COVERS[n % COVERS.length] +
    '">' +
    inner +
    "</" +
    tag +
    ">"
  );
};

const setStats = (selector, items) =>
  $$(selector).forEach((el, i) => {
    if (!items[i]) return;
    $("strong", el).textContent = Number(items[i][0]).toLocaleString();
    const small = $("small", el);
    if (small && items[i][1]) small.textContent = items[i][1];
  });

const fillSelect = (select, firstLabel, values) => {
  const keep = select.value;
  select.innerHTML =
    '<option value="">' +
    esc(firstLabel) +
    "</option>" +
    values.map((v) => "<option>" + esc(v) + "</option>").join("");
  if (values.includes(keep)) select.value = keep;
};

const setupList = ({ suffix, perPage, body, noun, rows, rowHTML }) => {
  const box = $(".pagination-" + suffix);
  const prev = $(".prev-" + suffix, box);
  const next = $(".next-" + suffix, box);
  const label = $(".count-" + suffix);
  const emptyMessage = $(".empty-" + suffix);
  let page = 1;

  const draw = () => {
    const list = rows();
    const pages = Math.max(1, Math.ceil(list.length / perPage));
    page = Math.min(page, pages);
    const start = (page - 1) * perPage;
    const slice = list.slice(start, start + perPage);

    body.innerHTML = slice.map(rowHTML).join("");
    label.textContent = list.length
      ? "Showing " +
        (start + 1) +
        " - " +
        (start + slice.length) +
        " of " +
        list.length +
        " " +
        noun
      : "Showing 0 of 0 " + noun;
    emptyMessage.hidden = list.length > 0;

    $$(".page-" + suffix, box)
      .filter((b) => b !== prev && b !== next)
      .forEach((b) => b.remove());
    const first = Math.max(1, Math.min(page - 2, pages - 4));
    const last = Math.min(pages, first + 4);
    for (let i = first; i <= last; i++) {
      const button = document.createElement("button");
      button.type = "button";
      button.className =
        "page-" + suffix + (i === page ? " current-" + suffix : "");
      button.textContent = i;
      button.addEventListener("click", () => {
        page = i;
        draw();
      });
      box.insertBefore(button, next);
    }
    prev.disabled = page <= 1;
    next.disabled = page >= pages;
  };

  prev.addEventListener("click", () => {
    if (page > 1) {
      page--;
      draw();
    }
  });
  next.addEventListener("click", () => {
    page++;
    draw();
  });

  return {
    draw: (reset) => {
      if (reset) page = 1;
      draw();
    },
  };
};

let refreshPage = () => {}; 
let updateBell = () => {};

const afterChange = () => {
  refreshPage();
  updateBell();
};


const openBorrow = ({ bookId = "", memberId = "" } = {}) => {
  const members = library.listMembers().filter((m) => m.status === "Active");
  const books = library.listBooks().filter((b) => b.available > 0);

  if (!members.length)
    return toast("There are no active members to lend to.", "error");
  if (!books.length)
    return toast("No copies are available right now.", "error");

  openDialog({
    title: "Borrow a book",
    sub: "Choose who is borrowing and which book they are taking.",
    body:
      '<label for="borrow-member">Member</label><select id="borrow-member" name="member">' +
      members
        .map(
          (m) =>
            '<option value="' +
            esc(m.id) +
            '"' +
            (m.id === memberId ? " selected" : "") +
            ">" +
            esc(m.name) +
            " (" +
            esc(m.id) +
            ")</option>",
        )
        .join("") +
      '</select><label for="borrow-book">Book</label><select id="borrow-book" name="book">' +
      books
        .map(
          (b) =>
            '<option value="' +
            esc(b.id) +
            '"' +
            (b.id === bookId ? " selected" : "") +
            ">" +
            esc(b.title) +
            " - " +
            b.available +
            " left</option>",
        )
        .join("") +
      '</select><label for="borrow-days">Loan period (days)</label><input id="borrow-days" name="days" type="number" min="1" max="60" value="' +
      LOAN_DAYS +
      '">',
    buttons: [
      { label: "Cancel" },
      { label: "Borrow book", kind: "primary", submit: true },
    ],
    onSubmit: (dialog) => {
      const days = parseInt(dialog.value("days"), 10);
      if (!(days >= 1 && days <= 60))
        return dialog.error("Loan period must be between 1 and 60 days.");
      const result = library.borrowBook(
        dialog.value("book"),
        dialog.value("member"),
        days,
      );
      if (!result.ok) return dialog.error(result.error);
      dialog.close();
      toast(
        result.record.title +
          " borrowed by " +
          result.record.member +
          ". Due " +
          fmtDate(result.record.dueDate) +
          ".",
      );
      afterChange();
    },
  });
};

const openReturn = (recordId = "", onReturned) => {
  const open = library.listBorrowings().filter((r) => r.status !== "Returned");
  if (!open.length)
    return toast("There are no borrowed books to return.", "error");

  openDialog({
    title: "Return a book",
    sub: "Pick the borrowed book that is being handed back.",
    body:
      '<label for="return-record">Borrowed book</label><select id="return-record" name="record">' +
      open
        .map(
          (r) =>
            '<option value="' +
            esc(r.id) +
            '"' +
            (r.id === recordId ? " selected" : "") +
            ">" +
            esc(r.title) +
            " - " +
            esc(r.member) +
            " (due " +
            esc(fmtDate(r.dueDate)) +
            (r.status === "Overdue" ? ", overdue" : "") +
            ")</option>",
        )
        .join("") +
      "</select>",
    buttons: [
      { label: "Cancel" },
      { label: "Confirm return", kind: "primary", submit: true },
    ],
    onSubmit: (dialog) => {
      const result = library.returnBook(dialog.value("record"));
      if (!result.ok) return dialog.error(result.error);
      dialog.close();
      if (onReturned) onReturned(result);
      else
        toast(
          result.record.title + " returned" + (result.late ? " (late)." : "."),
        );
      afterChange();
    },
  });
};

const recordDetails = (r) => {
  const buttons = [{ label: "Close" }];
  if (r.status !== "Returned") {
    buttons.push({
      label: "Return this book",
      kind: "primary",
      onClick: (dialog) => {
        dialog.close();
        openReturn(r.id);
      },
    });
  }
  showDetails(
    r.id + " - " + r.title,
    [
      ["Member", r.member],
      ["Borrowed", fmtDate(r.borrowedDate)],
      ["Due", fmtDate(r.dueDate)],
      ["Returned", r.returnedDate ? fmtDate(r.returnedDate) : "Not yet"],
      ["Status", r.status],
    ],
    buttons,
  );
};


const readFields = (form, selector) => {
  const values = {};
  form.querySelectorAll(selector).forEach((field) => {
    const label = field.querySelector("label");
    const control = field.querySelector("input, select, textarea");
    if (label && control)
      values[label.textContent.replace("*", "").trim().toLowerCase()] =
        control.value.trim();
  });
  return values;
};

const pick = (values, word) => {
  const key = Object.keys(values).find((item) => item.includes(word));
  return key ? values[key] : "";
};

const shrinkImage = (src) =>
  new Promise((resolve) => {
    if (!src) return resolve("");
    const img = new Image();
    img.onload = () => {
      const width = Math.min(240, img.width);
      const height = Math.round((img.height * width) / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => resolve("");
    img.src = src;
  });

const setupImagePicker = ({
  zone,
  fileInput,
  chooseButton,
  preview,
  content,
  fileName,
  label,
  showMessage,
  dragClass,
}) => {
  const maxSize = 99 * 1024 * 1024;
  const allowed = ["image/png", "image/jpeg"];

  const clear = () => {
    fileInput.value = "";
    preview.hidden = true;
    preview.removeAttribute("src");
    content.hidden = false;
    fileName.textContent = "";
  };

  const handle = (file) => {
    if (!file) return;
    if (!allowed.includes(file.type)) {
      clear();
      return showMessage(label + " must be a PNG, JPG or JPEG image.", "error");
    }
    if (file.size > maxSize) {
      clear();
      return showMessage(label + " must be 99MB or smaller.", "error");
    }
    const reader = new FileReader();
    reader.onload = () => {
      preview.src = reader.result;
      preview.hidden = false;
      content.hidden = true;
    };
    reader.readAsDataURL(file);
    fileName.textContent = file.name;
    showMessage("", "");
  };

  zone.addEventListener("click", () => fileInput.click());
  chooseButton.addEventListener("click", () => fileInput.click());
  zone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      fileInput.click();
    }
  });
  fileInput.addEventListener("change", () => handle(fileInput.files[0]));
  ["dragenter", "dragover"].forEach((type) =>
    zone.addEventListener(type, (event) => {
      event.preventDefault();
      zone.classList.add(dragClass);
    }),
  );
  ["dragleave", "drop"].forEach((type) =>
    zone.addEventListener(type, (event) => {
      event.preventDefault();
      zone.classList.remove(dragClass);
    }),
  );
  zone.addEventListener("drop", (event) => {
    const file = event.dataTransfer.files[0];
    if (file) {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      fileInput.files = transfer.files;
      handle(file);
    }
  });

  return { clear, current: () => (preview.hidden ? "" : preview.src) };
};


let idleTimer;
let lastActivity = 0;
const restartIdle = () => {
  clearTimeout(idleTimer);
  if (!isLoggedIn()) return;
  const minutes = Number(settings.logout) || 30;
  idleTimer = setTimeout(logout, minutes * 60000);
};


document.addEventListener("DOMContentLoaded", async () => {
  injectStyles();

  const here = (
    location.pathname.split("/").pop() || "index.html"
  ).toLowerCase();
  $$("#navigation .nav-link").forEach((link) => {
    const href = (link.getAttribute("href") || "").toLowerCase();
    if (href === "addbooks.html")
      link.setAttribute("href", "AvailableBooks.html");
    const target = (link.getAttribute("href") || "").toLowerCase();
    const booksSection = ["availablebooks.html", "addbooks.html"];
    const active =
      target === "availablebooks.html"
        ? booksSection.includes(here)
        : target === here;
    link.classList.toggle("active", active);
  });
  $$("a[href]").forEach((a) => {
    if ((a.getAttribute("href") || "").toLowerCase() === "addbooks.html")
      a.setAttribute("href", "AddBooks.html");
  });

  const searchInput = $("#searchInput");
  let searchIsLocal = false; 

  if (searchInput) {
    const goSearch = () => {
      const q = searchInput.value.trim();
      window.location.href =
        "AvailableBooks.html" + (q ? "?q=" + encodeURIComponent(q) : "");
    };
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !searchIsLocal) goSearch();
    });
    const glass = $("#searchBox .fa-magnifying-glass");
    if (glass) {
      glass.style.cursor = "pointer";
      glass.addEventListener("click", (event) => {
        event.preventDefault();
        if (searchIsLocal) searchInput.focus();
        else goSearch();
      });
    }
  }

  const profileButton = $("#profileBtn");
  if (profileButton) {
    const holder = profileButton.parentElement;
    holder.style.position = "relative";
    const menu = document.createElement("div");
    menu.className = "lms-menu";
    menu.hidden = true;
    menu.innerHTML =
      '<a href="Profile.html">My profile</a><button type="button">Log out</button>';
    holder.appendChild(menu);
    profileButton.addEventListener("click", (event) => {
      event.stopPropagation();
      menu.hidden = !menu.hidden;
    });
    $("button", menu).addEventListener("click", logout);
    document.addEventListener("click", () => {
      menu.hidden = true;
    });
  }

  if (isLoggedIn()) {
    const bump = () => {
      const now = Date.now();
      if (now - lastActivity > 5000) {
        lastActivity = now;
        restartIdle();
      }
    };
    ["click", "keydown", "mousemove", "touchstart"].forEach((type) =>
      document.addEventListener(type, bump, { passive: true }),
    );
    restartIdle();
  }

  await library.ready;

  const bell = $("#notification");
  updateBell = () => {
    const dot = bell && $(".notif-dot", bell);
    if (dot) dot.style.display = library.overdue().length ? "" : "none";
  };
  if (bell) {
    bell.addEventListener("click", () => {
      const late = library.overdue();
      openDialog({
        title: "Notifications",
        sub: late.length
          ? late.length +
            " overdue book" +
            (late.length === 1 ? "" : "s") +
            " need attention."
          : "You are all caught up. No overdue books.",
        body: late.length
          ? "<ul>" +
            late
              .map(
                (r) =>
                  "<li><strong>" +
                  esc(r.title) +
                  "</strong> - " +
                  esc(r.member) +
                  "<small>Due " +
                  esc(fmtDate(r.dueDate)) +
                  " (" +
                  daysBetween(r.dueDate, todayISO()) +
                  " days late)</small></li>",
              )
              .join("") +
            "</ul>"
          : "",
        buttons: [{ label: "Close" }].concat(
          late.length
            ? [
                {
                  label: "Open borrowing",
                  kind: "primary",
                  onClick: () => {
                    window.location.href = "Borrowing.html";
                  },
                },
              ]
            : [],
        ),
      });
    });
  }
  updateBell();

  if ($("#bookTable")) {
    const body = $("#bookTable tbody");

    refreshPage = () => {
      const s = library.stats();
      setStats("#stats .stat", [
        [s.copies, s.available + " copies available"],
        [s.members, s.activeMembers + " active members"],
        [s.borrowedThisMonth, "This month"],
        [s.overdue, s.overdue ? "Needs attention" : "All on time"],
      ]);

      const q = searchInput ? searchInput.value.trim() : "";
      const list = q ? library.search(q) : [...library.listBooks()].reverse();
      body.innerHTML =
        list
          .slice(0, 5)
          .map(
            (b) =>
              "<tr><td>" +
              coverHTML(b, "span") +
              '</td><td class="book-title">' +
              esc(b.title) +
              "</td><td>" +
              esc(b.author) +
              "</td><td>" +
              esc(b.category) +
              "</td>" +
              '<td class="' +
              (b.available ? "available" : "checked-out") +
              '">' +
              b.status +
              "</td></tr>",
          )
          .join("") ||
        '<tr><td colspan="5">No books match your search.</td></tr>';

      const icons = {
        book: ["green", "fa-book-medical"],
        member: ["blue", "fa-user-plus"],
        borrow: ["yellow", "fa-book-bookmark"],
        return: ["green", "fa-rotate-left"],
      };
      $("#activities").innerHTML =
        library
          .activity()
          .slice(0, 5)
          .map((a) => {
            const [color, icon] = icons[a.type] || icons.book;
            return (
              '<div class="activity"><span class="activity-icon ' +
              color +
              '"><i class="fa-solid ' +
              icon +
              '"></i></span>' +
              "<div><strong>" +
              esc(a.title) +
              "</strong><small>" +
              esc(a.sub) +
              "</small></div><time>" +
              esc(ago(a.at)) +
              "</time></div>"
            );
          })
          .join("") ||
        '<div class="activity"><div><strong>No activity yet</strong></div></div>';
    };

    const quick = $("#quickActions");
    if (quick) {
      const button = document.createElement("button");
      button.className = "quick-action";
      button.type = "button";
      button.innerHTML =
        '<i class="fa-solid fa-book-bookmark"></i> Borrow Book';
      button.addEventListener("click", () => openBorrow());
      quick.appendChild(button);
    }

    if (searchInput) searchInput.addEventListener("input", refreshPage);
    refreshPage();
  }

  const tableBooks = $(".table-availability");
  if (tableBooks) {
    searchIsLocal = true;
    const collectionSearch = $("#bookSearch-availability");
    const categoryFilter = $("#categoryFilter-availability");
    const statusFilter = $("#statusFilter-availability");
    const authorFilter = document.createElement("select");
    authorFilter.className = "filter-availability";
    authorFilter.id = "authorFilter-availability";
    authorFilter.setAttribute("aria-label", "Filter by author");
    categoryFilter.before(authorFilter);

    const fillFilters = () => {
      fillSelect(authorFilter, "All Authors", library.authors());
      fillSelect(
        categoryFilter,
        "All Categories",
        [...new Set([...DEFAULT_CATEGORIES, ...library.categories()])].sort(),
      );
    };

    const query = new URLSearchParams(location.search).get("q") || "";
    collectionSearch.value = query;
    if (searchInput) searchInput.value = query;

    const list = setupList({
      suffix: "availability",
      perPage: 7,
      noun: "books",
      body: $("tbody", tableBooks),
      rows: () =>
        library
          .search(collectionSearch.value, {
            category: categoryFilter.value,
            author: authorFilter.value,
          })
          .filter(
            (b) => !statusFilter.value || b.status === statusFilter.value,
          ),
      rowHTML: (b) =>
        '<tr data-id="' +
        esc(b.id) +
        '"><td>' +
        coverHTML(b) +
        '</td><td><strong class="title-availability">' +
        esc(b.title) +
        "</strong></td>" +
        "<td>" +
        esc(b.author) +
        "</td><td>" +
        esc(b.category) +
        "</td>" +
        '<td><span class="status-availability ' +
        (b.available ? "available" : "checkedout") +
        '-availability">' +
        b.status +
        "</span></td>" +
        '<td><div class="actions-cell-availability"><button class="menu-button-availability" type="button" aria-label="Book actions"><i class="fa-solid fa-ellipsis-vertical"></i></button>' +
        '<div class="menu-availability" hidden><button type="button" data-action="view">View Details</button>' +
        '<button type="button" data-action="borrow"' +
        (b.available ? "" : " disabled") +
        ">Borrow This Book</button>" +
        '<button type="button" data-action="remove">Remove Book</button></div></div></td></tr>',
    });

    refreshPage = () => {
      const s = library.stats();
      setStats(".stat-availability", [
        [s.copies],
        [s.members],
        [s.borrowed],
        [s.overdue],
      ]);
      fillFilters();
      list.draw();
    };

    collectionSearch.addEventListener("input", () => {
      if (searchInput) searchInput.value = collectionSearch.value;
      list.draw(true);
    });
    if (searchInput)
      searchInput.addEventListener("input", () => {
        collectionSearch.value = searchInput.value;
        list.draw(true);
      });
    [categoryFilter, authorFilter, statusFilter].forEach((f) =>
      f.addEventListener("change", () => list.draw(true)),
    );

    const closeMenus = () =>
      $$(".menu-availability", tableBooks).forEach((m) => {
        m.hidden = true;
      });

    tableBooks.addEventListener("click", (event) => {
      const menuButton = event.target.closest(".menu-button-availability");
      const actionButton = event.target.closest(".menu-availability button");

      if (menuButton) {
        const menu = menuButton.nextElementSibling;
        const wasHidden = menu.hidden;
        closeMenus();
        menu.hidden = !wasHidden;
        return;
      }
      if (!actionButton || actionButton.disabled) return;

      const id = actionButton.closest("tr").dataset.id;
      const book = library.getBook(id);
      const action = actionButton.dataset.action;
      closeMenus();
      if (!book) return;

      if (action === "view") {
        showDetails(book.title, [
          ["Author", book.author],
          ["Category", book.category],
          ["ISBN", book.isbn],
          ["Publisher", book.publisher],
          ["Year", book.year],
          ["Edition", book.edition],
          [
            "Copies",
            book.quantity +
              " total, " +
              book.available +
              " available, " +
              book.borrowed +
              " on loan",
          ],
          ["Status", book.status],
          ["Description", book.description],
        ]);
      }
      if (action === "borrow") openBorrow({ bookId: id });
      if (action === "remove") {
        confirmDialog(
          "Remove this book?",
          '"' + book.title + '" will be deleted from the library.',
          "Remove book",
          () => {
            const result = library.removeBook(id);
            if (!result.ok) return toast(result.error, "error");
            toast(book.title + " was removed.");
            afterChange();
          },
        );
      }
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".actions-cell-availability")) closeMenus();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenus();
    });
    refreshPage();
  }

  const tableMembers = $(".table-members");
  if (tableMembers) {
    searchIsLocal = true;
    const roleFilter = $("#roleFilter-members");
    const statusFilter = $("#statusFilter-members");

    const list = setupList({
      suffix: "members",
      perPage: 8,
      noun: "members",
      body: $("tbody", tableMembers),
      rows: () => {
        const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
        return library
          .listMembers()
          .filter(
            (m) =>
              [m.name, m.id, m.email, m.role, m.status]
                .join(" ")
                .toLowerCase()
                .includes(q) &&
              (!roleFilter.value || m.role === roleFilter.value) &&
              (!statusFilter.value || m.status === statusFilter.value),
          );
      },
      rowHTML: (m) => {
        const toggle =
          m.status === "Active"
            ? ["Suspend", "suspend"]
            : m.status === "Pending"
              ? ["Approve", "approve"]
              : ["Activate", "activate"];
        const avatar = m.photo
          ? '<img src="' +
            esc(m.photo) +
            '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">'
          : '<i class="fa-solid fa-user"></i>';
        return (
          '<tr data-id="' +
          esc(m.id) +
          '"><td><div class="person-members"><span class="avatar-members">' +
          avatar +
          "</span><strong>" +
          esc(m.name) +
          "</strong></div></td>" +
          "<td>" +
          esc(m.id) +
          "</td><td>" +
          esc(m.email) +
          "</td><td>" +
          esc(m.role) +
          "</td><td>" +
          esc(fmtDate(m.joined)) +
          "</td>" +
          '<td><span class="status-members ' +
          m.status.toLowerCase() +
          '-members">' +
          esc(m.status) +
          "</span></td>" +
          '<td><div class="actions-cell-members"><button class="menu-button-members" type="button" aria-label="Member actions"><i class="fa-solid fa-ellipsis"></i></button>' +
          '<div class="menu-members" hidden><button type="button" data-action="view">View Profile</button><button type="button" data-action="edit">Edit Member</button>' +
          '<button type="button" data-action="' +
          toggle[1] +
          '">' +
          toggle[0] +
          "</button></div></div></td></tr>"
        );
      },
    });

    refreshPage = () => {
      const s = library.stats();
      setStats(".stat-members", [
        [s.members],
        [s.activeMembers],
        [s.pendingMembers],
        [s.suspendedMembers],
      ]);
      list.draw();
    };

    if (searchInput)
      searchInput.addEventListener("input", () => list.draw(true));
    [roleFilter, statusFilter].forEach((f) =>
      f.addEventListener("change", () => list.draw(true)),
    );

    const closeMenus = () =>
      $$(".menu-members", tableMembers).forEach((m) => {
        m.hidden = true;
      });

    const editMember = (m) =>
      openDialog({
        title: "Edit member",
        sub: m.id,
        body:
          '<label for="em-name">Full name</label><input id="em-name" name="name" value="' +
          esc(m.name) +
          '">' +
          '<label for="em-email">Email</label><input id="em-email" name="email" type="email" value="' +
          esc(m.email) +
          '">' +
          '<label for="em-contact">Contact number</label><input id="em-contact" name="contact" value="' +
          esc(m.contact) +
          '">' +
          '<label for="em-role">Member type</label><select id="em-role" name="role">' +
          ["Student", "Faculty", "Staff"]
            .map(
              (r) =>
                "<option" +
                (r === m.role ? " selected" : "") +
                ">" +
                r +
                "</option>",
            )
            .join("") +
          "</select>" +
          '<label for="em-dept">Department / Program</label><input id="em-dept" name="department" value="' +
          esc(m.department) +
          '">' +
          '<label for="em-year">Year level</label><input id="em-year" name="yearLevel" value="' +
          esc(m.yearLevel) +
          '">',
        buttons: [
          { label: "Cancel" },
          { label: "Save changes", kind: "primary", submit: true },
        ],
        onSubmit: (dialog) => {
          const result = library.updateMember(m.id, {
            name: dialog.value("name"),
            email: dialog.value("email"),
            contact: dialog.value("contact"),
            role: dialog.value("role"),
            department: dialog.value("department"),
            yearLevel: dialog.value("yearLevel"),
          });
          if (!result.ok) return dialog.error(result.error);
          dialog.close();
          toast("Member updated.");
          afterChange();
        },
      });

    tableMembers.addEventListener("click", (event) => {
      const menuButton = event.target.closest(".menu-button-members");
      const actionButton = event.target.closest(".menu-members button");

      if (menuButton) {
        const menu = menuButton.nextElementSibling;
        const wasHidden = menu.hidden;
        closeMenus();
        menu.hidden = !wasHidden;
        return;
      }
      if (!actionButton) return;

      const member = library.getMember(actionButton.closest("tr").dataset.id);
      const action = actionButton.dataset.action;
      closeMenus();
      if (!member) return;

      if (action === "view") {
        const loans = library.memberLoans(member.id);
        showDetails(member.name, [
          ["Member ID", member.id],
          ["Email", member.email],
          ["Contact", member.contact],
          ["Type", member.role],
          ["Department", member.department],
          ["Year level", member.yearLevel],
          ["Status", member.status],
          ["Joined", fmtDate(member.joined)],
          [
            "Books on loan",
            loans.length
              ? loans
                  .map(
                    (r) =>
                      r.title + (r.status === "Overdue" ? " (overdue)" : ""),
                  )
                  .join(", ")
              : "None",
          ],
        ]);
      }
      if (action === "edit") editMember(member);
      if (["suspend", "activate", "approve"].includes(action)) {
        const status = action === "suspend" ? "Suspended" : "Active";
        library.setMemberStatus(member.id, status);
        toast(member.name + " is now " + status.toLowerCase() + ".");
        afterChange();
      }
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".actions-cell-members")) closeMenus();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenus();
    });
    refreshPage();
  }

  const tableBorrowing = $(".table-borrowing");
  if (tableBorrowing) {
    searchIsLocal = true;
    const recordSearch = $("#recordSearch-borrowing");
    const memberFilter = $("#memberFilter-borrowing");
    const bookFilter = $("#bookFilter-borrowing");

    const borrowButton = document.createElement("button");
    borrowButton.type = "button";
    borrowButton.className = "lms-btn primary lms-add-btn";
    borrowButton.innerHTML =
      '<i class="fa-solid fa-circle-plus"></i> Borrow Book';
    borrowButton.addEventListener("click", () => openBorrow());
    $(".toolbar-borrowing").appendChild(borrowButton);

    const list = setupList({
      suffix: "borrowing",
      perPage: 6,
      noun: "records",
      body: $("tbody", tableBorrowing),
      rows: () => {
        const q = (recordSearch.value || (searchInput ? searchInput.value : ""))
          .trim()
          .toLowerCase();
        return library
          .listBorrowings()
          .reverse()
          .filter(
            (r) =>
              [r.id, r.title, r.member, r.status]
                .join(" ")
                .toLowerCase()
                .includes(q) &&
              (!memberFilter.value || r.member === memberFilter.value) &&
              (!bookFilter.value || r.title === bookFilter.value),
          );
      },
      rowHTML: (r) =>
        '<tr data-id="' +
        esc(r.id) +
        '"><td><strong class="id-borrowing">' +
        esc(r.id) +
        "</strong></td><td>" +
        coverHTML({ id: r.bookId, cover: r.cover }) +
        "</td>" +
        '<td><strong class="title-borrowing">' +
        esc(r.title) +
        "</strong></td><td>" +
        esc(r.member) +
        "</td>" +
        "<td>" +
        esc(fmtDate(r.borrowedDate)) +
        "</td><td>" +
        esc(fmtDate(r.dueDate)) +
        "</td><td>" +
        esc(r.returnedDate ? fmtDate(r.returnedDate) : "-") +
        "</td>" +
        '<td><span class="status-borrowing ' +
        r.status.toLowerCase() +
        '-borrowing">' +
        r.status +
        "</span></td>" +
        '<td><div class="lms-row-actions"><button class="view-borrowing" type="button" data-action="view"><i class="fa-solid fa-eye"></i> View</button>' +
        (r.status !== "Returned"
          ? '<button class="lms-btn small primary" type="button" data-action="return">Return</button>'
          : "") +
        "</div></td></tr>",
    });

    refreshPage = () => {
      const s = library.stats();
      setStats(".stat-borrowing", [
        [s.totalBorrowings, "All records"],
        [s.activeMembers, "Registered users"],
        [s.overdue, s.overdue ? "Need attention" : "All on time"],
        [s.returned, "All time"],
      ]);
      fillSelect(
        memberFilter,
        "All Members",
        [...new Set(library.listBorrowings().map((r) => r.member))].sort(),
      );
      fillSelect(
        bookFilter,
        "All Books",
        [...new Set(library.listBorrowings().map((r) => r.title))].sort(),
      );
      list.draw();
    };

    recordSearch.addEventListener("input", () => list.draw(true));
    if (searchInput)
      searchInput.addEventListener("input", () => list.draw(true));
    [memberFilter, bookFilter].forEach((f) =>
      f.addEventListener("change", () => list.draw(true)),
    );

    tableBorrowing.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      const record = library
        .listBorrowings()
        .find((r) => r.id === button.closest("tr").dataset.id);
      if (!record) return;
      if (button.dataset.action === "view") recordDetails(record);
      if (button.dataset.action === "return") openReturn(record.id);
    });
    refreshPage();
  }

  const tableReturning = $(".table-returning");
  if (tableReturning) {
    searchIsLocal = true;
    const memberFilter = $("#memberFilter-returning");
    const bookFilter = $("#bookFilter-returning");
    const dateFrom = $("#dateFrom-returning");
    const dateTo = $("#dateTo-returning");
    const banner = $(".banner-returning");
    const refreshButton = $(".refresh-returning");

    dateFrom.value = "";
    dateTo.value = "";
    banner.style.display = "none";

    const showBanner = (result) => {
      $("strong", banner).textContent = "Book Returned Successfully!";
      $("span", banner).textContent =
        result.record.title +
        " was returned by " +
        result.record.member +
        (result.late ? " (late)." : ".") +
        " The member's record has been updated.";
      banner.style.display = "";
    };

    const returnButton = document.createElement("button");
    returnButton.type = "button";
    returnButton.className = "lms-btn primary lms-add-btn";
    returnButton.innerHTML =
      '<i class="fa-solid fa-arrow-right-to-bracket fa-flip-horizontal"></i> Return Book';
    returnButton.addEventListener("click", () => openReturn("", showBanner));
    refreshButton.before(returnButton);

    const list = setupList({
      suffix: "returning",
      perPage: 6,
      noun: "books",
      body: $("tbody", tableReturning),
      rows: () => {
        const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
        return library
          .listBorrowings()
          .filter((r) => r.returnedDate)
          .sort((a, b) => b.returnedDate.localeCompare(a.returnedDate))
          .filter(
            (r) =>
              [r.id, r.title, r.member].join(" ").toLowerCase().includes(q) &&
              (!memberFilter.value || r.member === memberFilter.value) &&
              (!bookFilter.value || r.title === bookFilter.value) &&
              (!dateFrom.value || r.returnedDate >= dateFrom.value) &&
              (!dateTo.value || r.returnedDate <= dateTo.value),
          );
      },
      rowHTML: (r) => {
        const late = r.returnedDate > r.dueDate;
        return (
          '<tr data-id="' +
          esc(r.id) +
          '"><td><strong class="id-returning">RT-' +
          esc(r.id.split("-").pop()) +
          "</strong></td><td>" +
          coverHTML({ id: r.bookId, cover: r.cover }) +
          "</td>" +
          '<td><strong class="title-returning">' +
          esc(r.title) +
          "</strong></td><td>" +
          esc(r.member) +
          "</td><td>" +
          esc(fmtDate(r.returnedDate)) +
          "</td><td>" +
          esc(fmtDate(r.dueDate)) +
          "</td>" +
          '<td><span class="status-returning' +
          (late ? " late-returning" : "") +
          '">' +
          (late ? "Returned Late" : "Returned") +
          "</span></td>" +
          '<td><button class="view-returning" type="button"><i class="fa-solid fa-eye"></i> View</button></td></tr>'
        );
      },
    });

    refreshPage = () => {
      const returned = library.listBorrowings().filter((r) => r.returnedDate);
      fillSelect(
        memberFilter,
        "All Members",
        [...new Set(returned.map((r) => r.member))].sort(),
      );
      fillSelect(
        bookFilter,
        "All Books",
        [...new Set(returned.map((r) => r.title))].sort(),
      );
      list.draw();
    };

    if (searchInput)
      searchInput.addEventListener("input", () => list.draw(true));
    [memberFilter, bookFilter, dateFrom, dateTo].forEach((f) =>
      f.addEventListener("change", () => list.draw(true)),
    );

    refreshButton.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      memberFilter.value = "";
      bookFilter.value = "";
      dateFrom.value = "";
      dateTo.value = "";
      banner.style.display = "none";
      refreshPage();
      list.draw(true);
      refreshButton.classList.remove("spin-returning");
      void refreshButton.offsetWidth;
      refreshButton.classList.add("spin-returning");
    });

    tableReturning.addEventListener("click", (event) => {
      const button = event.target.closest(".view-returning");
      if (!button) return;
      const record = library
        .listBorrowings()
        .find((r) => r.id === button.closest("tr").dataset.id);
      if (record) recordDetails(record);
    });
    refreshPage();
  }

  const formAddbooks = $(".form-addbooks");
  if (formAddbooks) {
    const message = $(".message-addbooks", formAddbooks);
    const showMessage = (text, type) => {
      message.textContent = text;
      message.className =
        "message-addbooks" + (type ? " " + type + "-addbooks" : "");
    };

    const picker = setupImagePicker({
      zone: $(".dropzone-addbooks", formAddbooks),
      fileInput: $(".file-input-addbooks", formAddbooks),
      chooseButton: $(".choose-file-addbooks", formAddbooks),
      preview: $(".preview-addbooks", formAddbooks),
      content: $(".dropzone-content-addbooks", formAddbooks),
      fileName: $(".file-name-addbooks", formAddbooks),
      label: "Cover",
      showMessage,
      dragClass: "dragover-addbooks",
    });

    formAddbooks.addEventListener("submit", async (event) => {
      event.preventDefault();
      let valid = true;
      $$("[required]", formAddbooks).forEach((field) => {
        const isEmpty = !field.value.trim();
        field.classList.toggle("invalid-addbooks", isEmpty);
        if (isEmpty) valid = false;
      });
      if (!valid)
        return showMessage("Please fill in all required fields.", "error");

      const values = readFields(formAddbooks, ".field-addbooks");
      const year = Number(pick(values, "year"));
      if (year && (year < 1000 || year > 2100))
        return showMessage(
          "Publication year must be between 1000 and 2100.",
          "error",
        );

      const cover = await shrinkImage(picker.current());
      const result = library.addBook({
        title: pick(values, "title"),
        author: pick(values, "author"),
        category: pick(values, "category"),
        isbn: pick(values, "isbn"),
        publisher: pick(values, "publisher"),
        edition: pick(values, "edition"),
        year: pick(values, "year"),
        quantity: pick(values, "quantity"),
        description: pick(values, "description"),
        cover,
      });
      if (!result.ok) return showMessage(result.error, "error");

      showMessage("", "");
      formAddbooks.reset();
      picker.clear();
      if (!result.saved)
        toast("Browser storage is full. This book may not be saved.", "error");
      showModal(
        result.merged
          ? "Copies added to the existing book!"
          : "Book Added Successfully!",
      );
    });

    formAddbooks.addEventListener("input", (event) =>
      event.target.classList.remove("invalid-addbooks"),
    );
  }

  /*  Register member  */
  const formRegistermember = $(".form-registermember");
  if (formRegistermember) {
    const guest = !isLoggedIn(); 
    const message = $(".message-registermember", formRegistermember);
    const dateField = $("#date-registermember");
    const emailField = $("#email-registermember");
    const statusField = $("#status-registermember");

    const showMessage = (text, type) => {
      message.textContent = text;
      message.className =
        "message-registermember" + (type ? " " + type + "-registermember" : "");
    };
    const setDate = () => {
      dateField.value = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    if (guest) {
      $("#sidebar").style.display = "none";
      $("#app").style.display = "block";
      const topActions = $("#topActions");
      if (topActions) topActions.style.display = "none";
      statusField.innerHTML = "<option>Pending</option>";
      statusField.disabled = true;
      $(".cancel-registermember", formRegistermember).setAttribute(
        "href",
        "index.html",
      );
    }

    const picker = setupImagePicker({
      zone: $(".photo-zone-registermember", formRegistermember),
      fileInput: $(".file-input-registermember", formRegistermember),
      chooseButton: $(".choose-file-registermember", formRegistermember),
      preview: $(".preview-registermember", formRegistermember),
      content: $(".photo-content-registermember", formRegistermember),
      fileName: $(".file-name-registermember", formRegistermember),
      label: "Photo",
      showMessage,
      dragClass: "dragover-registermember",
    });

    setDate();

    formRegistermember.addEventListener("submit", async (event) => {
      event.preventDefault();
      let valid = true;
      $$("[required]", formRegistermember).forEach((field) => {
        const isEmpty = !field.value.trim();
        field
          .closest(".input-wrap-registermember")
          .classList.toggle("invalid-registermember", isEmpty);
        if (isEmpty) valid = false;
      });
      if (!valid)
        return showMessage("Please fill in all required fields.", "error");

      if (!emailField.checkValidity()) {
        emailField
          .closest(".input-wrap-registermember")
          .classList.add("invalid-registermember");
        return showMessage("Please enter a valid email address.", "error");
      }

      const values = readFields(formRegistermember, ".field-registermember");
      const photo = await shrinkImage(picker.current());
      const result = library.addMember({
        name: pick(values, "name"),
        email: pick(values, "email"),
        studentId: pick(values, "student"),
        contact: pick(values, "contact"),
        role: pick(values, "type"),
        yearLevel: pick(values, "level"),
        department: pick(values, "department"),
        status: guest ? "Pending" : pick(values, "status"),
        photo,
      });
      if (!result.ok) return showMessage(result.error, "error");

      showMessage("", "");
      formRegistermember.reset();
      picker.clear();
      setDate();
      if (guest)
        showModal(
          "Request sent! A librarian will approve your account.",
          () => {
            window.location.href = "index.html";
          },
        );
      else showModal("Registered Successfully!");
    });

    formRegistermember.addEventListener("input", (event) => {
      const wrap = event.target.closest(".input-wrap-registermember");
      if (wrap) wrap.classList.remove("invalid-registermember");
    });
  }

  /* Settings  */
  const formSettings = $(".form-settings");
  if (formSettings) {
    const tabs = $$(".tab-settings");
    const title = $(".title-settings");
    const emptyPanel = $(".empty-settings");
    const message = $(".message-settings", formSettings);
    const notice = $(".notice-settings");
    const fields = {
      systemName: $("#systemName-settings"),
      language: $("#language-settings"),
      timeZone: $("#timeZone-settings"),
      dateFormat: $("#dateFormat-settings"),
      logout: $("#logout-settings"),
    };

    Object.entries(fields).forEach(([key, el]) => {
      if (settings[key] !== undefined) el.value = settings[key];
    });

    const showMessage = (text, type) => {
      message.textContent = text;
      message.className =
        "message-settings" + (type ? " " + type + "-settings" : "");
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        tabs.forEach((item) => item.classList.remove("current-settings"));
        tab.classList.add("current-settings");
        title.textContent = tab.dataset.title;
        formSettings.hidden = index !== 0;
        emptyPanel.hidden = index === 0;
        showMessage("", "");
      });
    });

    formSettings.addEventListener("submit", (event) => {
      event.preventDefault();
      let valid = true;
      $$("[required]", formSettings).forEach((field) => {
        const isEmpty = !field.value.trim();
        field.classList.toggle("invalid-settings", isEmpty);
        if (isEmpty) valid = false;
      });
      if (!valid)
        return showMessage("Please fill in all required fields.", "error");

      const minutes = Number(fields.logout.value);
      const min = Number(fields.logout.min);
      const max = Number(fields.logout.max);
      if (!Number.isInteger(minutes) || minutes < min || minutes > max) {
        fields.logout.classList.add("invalid-settings");
        return showMessage(
          "Auto log out must be between " + min + " and " + max + " minutes.",
          "error",
        );
      }

      settings = {};
      Object.entries(fields).forEach(([key, el]) => {
        settings[key] = el.value.trim();
      });
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      } catch (error) {
        return showMessage(
          "Could not save settings. Browser storage is unavailable.",
          "error",
        );
      }
      restartIdle();
      showMessage("Settings saved successfully.", "success");
    });

    formSettings.addEventListener("input", (event) =>
      event.target.classList.remove("invalid-settings"),
    );

    const restoreInput = document.createElement("input");
    restoreInput.type = "file";
    restoreInput.accept = "application/json,.json";
    restoreInput.hidden = true;
    document.body.appendChild(restoreInput);
    restoreInput.addEventListener("change", async () => {
      const file = restoreInput.files[0];
      restoreInput.value = "";
      if (!file) return;
      try {
        const result = library.importData(JSON.parse(await file.text()));
        notice.textContent = result.ok
          ? "Backup restored. " + library.stats().titles + " titles loaded."
          : result.error;
      } catch (error) {
        notice.textContent = "That file could not be read as a backup.";
      }
    });

    $$(".action-settings").forEach((button) => {
      button.addEventListener("click", () => {
        const name = $("strong", button).textContent.trim().toLowerCase();

        if (name === "backup now") {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(
            new Blob([library.exportData()], { type: "application/json" }),
          );
          link.download = "pcc-library-backup-" + todayISO() + ".json";
          link.click();
          URL.revokeObjectURL(link.href);
          notice.textContent = "Backup downloaded.";
        } else if (name === "restore data") {
          restoreInput.click();
        } else if (name === "clear cache") {
          confirmDialog(
            "Reset library data?",
            "This removes the saved library data in this browser and reloads the starter data. Back up first if you need it.",
            "Reset data",
            () => library.reset(),
          );
        } else {
          notice.textContent = button.dataset.message;
        }
      });
    });
  }

  /*  Profile  */
  const layoutProfile = $(".layout-profile");
  if (layoutProfile) {
    const defaults = {
      name: "Library Admin",
      email: "Admin@pccnet.edu.ph",
      phone: "+63 999 999 9999",
      username: "Libraryadmin",
    };
    const fields = $$(".field-profile", layoutProfile);
    const message = $(".message-profile");
    const editAllButton = $(".edit-all-profile");
    const editAllIcon = $("i", editAllButton);
    const editAllLabel = $("span", editAllButton);
    const passwordButton = $(".password-profile");

    const validators = {
      name: (v) => (v ? "" : "Full name is required."),
      email: (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
          ? ""
          : "Please enter a valid email address.",
      phone: (v) =>
        /^\+?[\d\s-]{7,20}$/.test(v)
          ? ""
          : "Please enter a valid phone number.",
      username: (v) =>
        /^\S{3,}$/.test(v)
          ? ""
          : "Username must be at least 3 characters with no spaces.",
    };

    let profile = { ...defaults };
    try {
      const stored = JSON.parse(localStorage.getItem(PROFILE_KEY));
      if (stored) profile = { ...defaults, ...stored };
    } catch (error) {
      profile = { ...defaults };
    }

    const showMessage = (text, type) => {
      message.textContent = text;
      message.className =
        "message-profile" + (type ? " " + type + "-profile" : "");
    };
    const render = () =>
      $$("[data-bind]").forEach((el) => {
        el.textContent = profile[el.dataset.bind];
      });
    const isEditing = (field) => Boolean($(".input-profile", field));

    const setEditIcon = (field, editing) => {
      const button = $(".edit-profile", field);
      const name = $(".label-profile", field).textContent.toLowerCase();
      $("i", button).className = editing
        ? "fa-solid fa-check"
        : "fa-solid fa-pencil";
      button.setAttribute("aria-label", (editing ? "Save " : "Edit ") + name);
    };
    const syncEditAll = () => {
      const editing = fields.some(isEditing);
      editAllIcon.className = editing
        ? "fa-solid fa-check"
        : "fa-solid fa-pencil";
      editAllLabel.textContent = editing ? "Save Profile" : "Edit Profile";
    };

    const startEdit = (field) => {
      if (isEditing(field)) return $(".input-profile", field);
      const key = field.dataset.field;
      const value = $(".value-profile", field);
      const input = document.createElement("input");
      input.className = "input-profile";
      input.type = key === "email" ? "email" : key === "phone" ? "tel" : "text";
      input.value = profile[key];
      input.setAttribute("aria-label", $(".label-profile", field).textContent);
      value.hidden = true;
      value.after(input);
      setEditIcon(field, true);
      return input;
    };
    const endEdit = (field) => {
      const input = $(".input-profile", field);
      if (input) input.remove();
      $(".value-profile", field).hidden = false;
      setEditIcon(field, false);
    };
    const commit = (field) => {
      const input = $(".input-profile", field);
      if (!input) return true;
      const key = field.dataset.field;
      const value = input.value.trim();
      const error = validators[key](value);
      if (error) {
        input.classList.add("invalid-profile");
        input.focus();
        showMessage(error, "error");
        return false;
      }
      profile[key] = value;
      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      } catch (e) {
      }
      endEdit(field);
      render();
      return true;
    };

    render();

    fields.forEach((field) => {
      const editButton = $(".edit-profile", field);
      editButton.addEventListener("click", () => {
        showMessage("", "");
        if (isEditing(field)) {
          if (commit(field)) showMessage("Profile updated.", "success");
        } else startEdit(field).focus();
        syncEditAll();
      });
      field.addEventListener("keydown", (event) => {
        if (!isEditing(field)) return;
        if (event.key === "Enter") {
          event.preventDefault();
          editButton.click();
        }
        if (event.key === "Escape") {
          endEdit(field);
          showMessage("", "");
          syncEditAll();
        }
      });
      field.addEventListener("input", (event) =>
        event.target.classList.remove("invalid-profile"),
      );
    });

    editAllButton.addEventListener("click", () => {
      showMessage("", "");
      if (fields.some(isEditing)) {
        if (fields.every(commit)) showMessage("Profile updated.", "success");
      } else {
        fields.forEach(startEdit);
        $(".input-profile", fields[0]).focus();
      }
      syncEditAll();
    });

    passwordButton.addEventListener("click", () =>
      openDialog({
        title: "Change password",
        body:
          '<label for="pw-current">Current password</label><input id="pw-current" type="password" name="current" autocomplete="current-password">' +
          '<label for="pw-next">New password</label><input id="pw-next" type="password" name="next" autocomplete="new-password">' +
          '<label for="pw-repeat">Confirm new password</label><input id="pw-repeat" type="password" name="repeat" autocomplete="new-password">',
        buttons: [
          { label: "Cancel" },
          { label: "Save password", kind: "primary", submit: true },
        ],
        onSubmit: (dialog) => {
          const current = dialog.el.elements.current.value;
          const next = dialog.el.elements.next.value;
          const repeat = dialog.el.elements.repeat.value;
          if (!current) return dialog.error("Enter your current password.");
          if (next.length < 8)
            return dialog.error("New password must be at least 8 characters.");
          if (next === current)
            return dialog.error(
              "New password must be different from the current one.",
            );
          if (next !== repeat)
            return dialog.error("New passwords do not match.");
          dialog.close();
          showModal("Password Changed Successfully!");
        },
      }),
    );
  }

  const formLogin = $(".form-login");
  if (formLogin) {
    const account = { username: "admin", password: "admin123" };
    const userField = $("#user-login", formLogin);
    const passwordField = $("#password-login", formLogin);
    const toggleButton = $(".toggle-login", formLogin);
    const message = $(".message-login", formLogin);

    const showMessage = (text, type) => {
      message.textContent = text;
      message.className = "message-login" + (type ? " " + type + "-login" : "");
    };

    toggleButton.addEventListener("click", () => {
      const showing = passwordField.type === "text";
      passwordField.type = showing ? "password" : "text";
      toggleButton.setAttribute("aria-pressed", String(!showing));
      toggleButton.setAttribute(
        "aria-label",
        showing ? "Show password" : "Hide password",
      );
      $("i", toggleButton).className = showing
        ? "fa-regular fa-eye-slash"
        : "fa-regular fa-eye";
      passwordField.focus();
    });

    $(".forgot-login", formLogin).addEventListener("click", (event) => {
      event.preventDefault();
      showMessage(
        "Contact the library administrator to reset your password.",
        "",
      );
    });

    formLogin.addEventListener("input", (event) => {
      event.target.classList.remove("invalid-login");
      showMessage("", "");
    });

    formLogin.addEventListener("submit", (event) => {
      event.preventDefault();
      const username = userField.value.trim().toLowerCase();
      const password = passwordField.value;

      if (!username || !password) {
        userField.classList.toggle("invalid-login", !username);
        passwordField.classList.toggle("invalid-login", !password);
        showMessage("Please enter your username and password.", "error");
        (username ? passwordField : userField).focus();
        return;
      }

      let adminEmail = "admin@pccnet.edu.ph";
      try {
        const saved = JSON.parse(localStorage.getItem(PROFILE_KEY));
        if (saved && saved.email) adminEmail = saved.email.toLowerCase();
      } catch (error) {
      }

      if (
        ![account.username, adminEmail].includes(username) ||
        password !== account.password
      ) {
        userField.classList.add("invalid-login");
        passwordField.classList.add("invalid-login");
        passwordField.value = "";
        passwordField.focus();
        showMessage("Incorrect username or password.", "error");
        return;
      }

      try {
        sessionStorage.setItem(SESSION_KEY, "true");
      } catch (error) {
        return showMessage(
          "Sign in needs browser storage to be enabled.",
          "error",
        );
      }
      showMessage("Signed in. Redirecting...", "success");
      window.location.href = "home.html";
    });
  }
});
