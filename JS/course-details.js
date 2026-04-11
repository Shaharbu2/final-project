const saveBtn = document.getElementById("saveBtn");
const downloadBtn = document.getElementById("downloadBtn");
const actionMessage = document.getElementById("actionMessage");

saveBtn.addEventListener("click", () => {
  saveBtn.classList.toggle("saved");

  if (saveBtn.classList.contains("saved")) {
    saveBtn.textContent = "נשמר בהצלחה ✅";
    actionMessage.textContent = "הקורס נוסף לרשימת הקורסים השמורים שלך";
  } else {
    saveBtn.textContent = "שמור לקורסים שלי ❤️";
    actionMessage.textContent = "הקורס הוסר מרשימת הקורסים השמורים";
  }
});

downloadBtn.addEventListener("click", () => {
  actionMessage.textContent = "ההורדה לא מומשה בפרויקט זה";
});