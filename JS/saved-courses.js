console.log("JS מחובר!");

const buttons = document.querySelectorAll(".filter-btn");
const cards = document.querySelectorAll(".course-card");
const message = document.getElementById("resultsMessage");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {

    // שינוי צבע כפתור
    buttons.forEach((b) => b.classList.remove("active-btn"));
    btn.classList.add("active-btn");

    // סינון
    const filter = btn.dataset.filter;
    let count = 0;

    cards.forEach((card) => {
      if (filter === "all" || card.dataset.type === filter) {
        card.style.display = "block";
        count++;
      } else {
        card.style.display = "none";
      }
    });

    // עדכון טקסט
    message.textContent = `כרגע מוצגים ${count} פריטים`;
  });
});