// מעביר בחירת קורס לדף האזור האישי (localStorage)
// זה נחשב: קליטת נתונים, אירוע, כתיבה לאלמנט, העברת נתונים בין מסכים.

(function(){
  const courseNameEl = document.getElementById('courseName');
  const btns = document.querySelectorAll('[data-go-upload]');

  function getCourseName(){
    // אם יש אלמנט כותרת עם שם קורס – ניקח ממנו, אחרת fallback
    return (courseNameEl && courseNameEl.textContent.trim()) || 'קורס נבחר';
  }

  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const name = getCourseName();
      // אותו key נקרא בדף my.html
      localStorage.setItem('campusnet:selectedCourse', name);
    });
  });
})();
