// אזור אישי + ולידציות (לפחות 2 ולידציות ב-JS)

(function(){
  const qs = (s, root=document) => root.querySelector(s);
  const qsa = (s, root=document) => Array.from(root.querySelectorAll(s));

  const form = qs('#uploadForm');
  const notice = qs('#formNotice');
  const toggleBtn = qs('#btnToggleForm');
  const uploadPanel = qs('#uploadPanel');

  // העברת נתונים בין מסכים: קורס נבחר נשמר ב-localStorage (מגיע מדף קורס)
  const storedCourse = localStorage.getItem('campusnet:selectedCourse');
  const storedHint = qs('#selectedCourseHint');
  const courseInput = qs('#course');
  if(storedCourse && courseInput){
    courseInput.value = storedCourse;
    storedHint.textContent = `נבחר אוטומטית: ${storedCourse}`;
  }

  // אלמנט שמגיב לאירוע + עיצוב דינמי במחלקה
  if(toggleBtn && uploadPanel){
    toggleBtn.addEventListener('click', () => {
      uploadPanel.classList.toggle('is-collapsed');
      const collapsed = uploadPanel.classList.contains('is-collapsed');
      uploadPanel.style.display = collapsed ? 'none' : 'block';
      toggleBtn.textContent = collapsed ? '+ העלאת חומר חדש' : 'הסתרת טופס';
    });
  }

  // סינון התרומות שלי
  const feed = qs('#myFeed');
  qsa('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      qsa('[data-filter]').forEach(b => b.classList.remove('pill-active'));
      btn.classList.add('pill-active');

      const f = btn.getAttribute('data-filter');
      qsa('.feed-item', feed).forEach(item => {
        const type = item.getAttribute('data-type');
        item.style.display = (f === 'all' || f === type) ? 'block' : 'none';
      });
    });
  });

  // דמו כפתורי עריכה/מחיקה: פידבק מתאים
  if(feed){
    feed.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if(!btn) return;
      const action = btn.getAttribute('data-action');
      const title = btn.closest('.feed-item')?.querySelector('h4')?.textContent || 'הפריט';
      alert(`${action === 'edit' ? 'עריכה' : 'מחיקה'} – טרם מומש
(${title})`);
    });
  }

  if(!form) return;

  const fields = {
    title: qs('#contentTitle'),
    type: qs('#contentType'),
    inst: qs('#institution'),
    degree: qs('#degree'),
    course: qs('#course'),
    semester: qs('#semester'),
    // לא חובה בפרויקט, אבל נשמר למקרה שתוסיפי בהמשך
    tags: qs('#tags'),
    desc: qs('#description'),
    file: qs('#fileUpload'),
  };

  const errors = {
    title: qs('#errTitle'),
    type: qs('#errType'),
    inst: qs('#errInstitution'),
    degree: qs('#errDegree'),
    course: qs('#errCourse'),
    semester: qs('#errSemester'),
    tags: qs('#errTags'),
    desc: qs('#errDesc'),
    file: qs('#errFile'),
  };

  function setError(el, errEl, msg){
    if(!el || !errEl) return;
    errEl.textContent = msg || '';
    el.classList.toggle('is-invalid', Boolean(msg));
  }

  // ולידציות JS (לא רק ריק)
  function validate(){
    let ok = true;

    // 1) כותרת: מינימום 6 תווים + לא רק מספרים
    const t = (fields.title.value || '').trim();
    if(t.length < 6 || /^\d+$/.test(t)){
      setError(fields.title, errors.title, 'כותרת חייבת להיות לפחות 6 תווים ולא רק מספרים.');
      ok = false;
    } else {
      setError(fields.title, errors.title, '');
    }

    // 2) תיאור: מינימום 20 תווים
    const d = (fields.desc.value || '').trim();
    if(d.length < 20){
      setError(fields.desc, errors.desc, 'תיאור חייב להיות לפחות 20 תווים.');
      ok = false;
    } else {
      setError(fields.desc, errors.desc, '');
    }

    // 3) קובץ: PDF בלבד + עד 10MB
    const f = fields.file.files && fields.file.files[0];
    if(!f){
      setError(fields.file, errors.file, 'חובה לצרף קובץ.');
      ok = false;
    } else {
      const isPdf = (f.type === 'application/pdf') || (f.name.toLowerCase().endsWith('.pdf'));
      const under10 = f.size <= 10 * 1024 * 1024;
      if(!isPdf){
        setError(fields.file, errors.file, 'ניתן להעלות PDF בלבד.');
        ok = false;
      } else if(!under10){
        setError(fields.file, errors.file, 'הקובץ גדול מדי (מומלץ עד 10MB).');
        ok = false;
      } else {
        setError(fields.file, errors.file, '');
      }
    }

    // 4) קורס: מינימום 3 תווים + לא רק מספרים
    const c = (fields.course.value || '').trim();
    if(c.length < 3 || /^\d+$/.test(c)){
      setError(fields.course, errors.course, 'שם קורס חייב להיות לפחות 3 תווים ולא רק מספרים.');
      ok = false;
    } else {
      // אם עברנו את בדיקת הקורס – ננקה שגיאה (גם אם בדיקת חובה תופסת)
      setError(fields.course, errors.course, '');
    }

    // שאר שדות חובה (אפשר להשאיר כאן רק ריק/לא ריק)
    [['type','type'], ['inst','inst'], ['degree','degree'], ['course','course'], ['semester','semester']].forEach(([k,ek]) => {
      const el = fields[k];
      const v = (el.value || '').trim();
      if(!v){
        setError(el, errors[ek], 'שדה חובה.');
        ok = false;
      } else {
        // לא לדרוס הודעת שגיאה ספציפית של קורס
        if(!(k === 'course' && errors.course?.textContent)) setError(el, errors[ek], '');
      }
    });

    // תגיות: אם יש — רק אותיות/מספרים/רווח/פסיק
    // תגיות – אופציונלי (לא מופיע כרגע ב-HTML)
    if(fields.tags){
      const tags = (fields.tags.value || '').trim();
      if(tags && !/^[\w֐-׿\s,\-]+$/.test(tags)){
        setError(fields.tags, errors.tags, 'תגיות יכולות לכלול אותיות/מספרים/רווח/פסיק בלבד.');
        ok = false;
      } else {
        setError(fields.tags, errors.tags, '');
      }
    }

    return ok;
  }

  // כתיבה לתוך אלמנט (פידבק)
  function setNotice(text, kind){
    notice.textContent = text || '';
    notice.classList.remove('ok','bad');
    if(kind) notice.classList.add(kind);
  }

  // הודעה שחוזרת מה-PHP (my.html?status=ok&msg=...)
  (function showServerMsg(){
    if(!notice) return;
    const params = new URLSearchParams(location.search);
    const msg = params.get('msg');
    const status = params.get('status');
    if(msg){
      setNotice(decodeURIComponent(msg), status === 'ok' ? 'ok' : 'bad');
    }
  })();

  form.addEventListener('submit', (e) => {
    if(!validate()){
      e.preventDefault();
      setNotice('יש לתקן את השדות המסומנים לפני שליחה.', 'bad');
      return;
    }

    // אם עובדים דרך שרת (PHP) – נאפשר שליחה אמיתית ל-DB.
    // אם פותחים כקובץ (file://) אין PHP; במקרה כזה נציג הודעת דמו כדי שלא תהיה שגיאה.
    if(location.protocol === 'file:'){
      e.preventDefault();
      const current = Number(qs('#statUploads')?.textContent || '0');
      if(qs('#statUploads')) qs('#statUploads').textContent = String(current + 1);
      setNotice('דמו: פתחת את הפרויקט כקובץ. כדי לשמור ל-DB, הריצי דרך שרת PHP (XAMPP/WAMP) והטופס יישלח ל-Includes/upload.php.', 'ok');
      form.reset();
      localStorage.removeItem('campusnet:selectedCourse');
      storedHint.textContent = 'טיפ: אם הגעת מדף קורס – הקורס יופיע אוטומטית בטופס.';
    }
  });

  qs('#btnReset')?.addEventListener('click', () => setNotice('', null));
})();
