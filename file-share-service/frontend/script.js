const authArea = document.getElementById("authArea");
const uploadArea = document.getElementById("uploadArea");
const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authBtn = document.getElementById("authBtn");
const toggleLink = document.getElementById("toggleLink");
const toggleLine = document.getElementById("toggleLine");
const authMsg = document.getElementById("authMsg");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const uploadForm = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const status = document.getElementById("status");
const linkArea = document.getElementById("linkArea");
const downloadLink = document.getElementById("downloadLink");
const copyBtn = document.getElementById("copyBtn");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progress");
const progressText = document.getElementById("progressText");
const logoutBtn = document.getElementById("logoutBtn");

let mode = "login";

function showAuth() {
  authArea.classList.remove("hidden");
  uploadArea.classList.add("hidden");
  authMsg.textContent = "";
}

function showUpload() {
  authArea.classList.add("hidden");
  uploadArea.classList.remove("hidden");
  authMsg.textContent = "";
}

function token() { return localStorage.getItem("token"); }

if (token()) showUpload(); else showAuth();

toggleLink.addEventListener("click", (e) => {
  e.preventDefault();
  if (mode === "login") {
    mode = "register";
    authTitle.textContent = "Зарегистрироваться";
    authBtn.textContent = "Зарегистрироваться";
    toggleLine.innerHTML = 'Уже есть аккаунт? <a href="#" id="toggleLink">Войти</a>';
  } else {
    mode = "login";
    authTitle.textContent = "Войти";
    authBtn.textContent = "Войти";
    toggleLine.innerHTML = 'Нет аккаунта? <a href="#" id="toggleLink">Зарегистрироваться</a>';
  }
});

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authMsg.textContent = "";
  const u = usernameInput.value.trim();
  const p = passwordInput.value.trim();
  if (!u || !p) { authMsg.textContent = "Введите логин и пароль"; return; }
  try {
    const url = mode === "login" ? "/api/login" : "/api/register";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    if (!res.ok) {
      authMsg.textContent = data.error || "Ошибка";
      return;
    }
    if (mode === "login") {
      localStorage.setItem("token", data.token);
      showUpload();
    } else {
      authMsg.style.color = "green";
      authMsg.textContent = "Успешно. Теперь войдите.";
      mode = "login";
      authTitle.textContent = "Войти";
      authBtn.textContent = "Войти";
      toggleLine.innerHTML = 'Нет аккаунта? <a href="#" id="toggleLink">Зарегистрироваться</a>';
    }
  } catch (err) {
    authMsg.textContent = "Сетевая ошибка";
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  showAuth();
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(downloadLink.value).then(() => alert("Скопировано"));
});

uploadForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = fileInput.files[0];
  if (!f) return alert("Выберите файл");
  uploadFile(f);
});

async function uploadFile(file) {
  status.classList.remove("hidden");
  status.textContent = "Подготовка...";
  linkArea.classList.add("hidden");
  progressContainer.classList.remove("hidden");
  progressBar.value = 0;
  progressText.textContent = "";

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/upload");
  const t = token();
  if (t) xhr.setRequestHeader("Authorization", "Bearer " + t);

  xhr.upload.onprogress = (e) => {
    if (!e.lengthComputable) return;
    const percent = Math.round((e.loaded / e.total) * 100);
    progressBar.value = percent;
    progressText.textContent = percent + "%";
  };

  xhr.onload = () => {
    if (xhr.status === 401) {
      alert("Неавторизован. Войдите снова.");
      localStorage.removeItem("token");
      showAuth();
      return;
    }
    if (xhr.status >= 200 && xhr.status < 300) {
      const data = JSON.parse(xhr.responseText);
      status.textContent = "Загрузка завершена";
      downloadLink.value = data.link;
      linkArea.classList.remove("hidden");
    } else {
      status.textContent = "Ошибка: " + xhr.status + " " + xhr.responseText;
    }
  };

  xhr.onerror = () => { status.textContent = "Сетевая ошибка"; };

  const fd = new FormData();
  fd.append("file", file);
  xhr.send(fd);
}
