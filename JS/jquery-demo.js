// jQuery demo (נדרש בהנחיות): אנימציה/אפקט + גלילה + חיווי קצר
// עובד בנוסף ל-JS הרגיל (my.js)

(function($){
  $(function(){
    // 1) גלילה חלקה לטופס העלאה בלחיצה על הכפתור
    $('#btnToggleForm').on('click', function(){
      const $panel = $('#uploadPanel');
      if(!$panel.length) return;

      // אם הפאנל הוסתר ע"י JS אחר, ננסה להראות בעדינות
      if($panel.is(':hidden')){
        $panel.stop(true,true).fadeIn(180);
      }

      $('html, body').stop(true).animate({
        scrollTop: $panel.offset().top - 90
      }, 260);
    });

    // 2) חיווי hover קטן לכפתורי דמו (עריכה/מחיקה) – בלי להסתמך רק על alert
    $(document).on('mouseenter', 'button[data-action]', function(){
      $(this).attr('title', 'טרם מומש – דמו בלבד');
    });
  });
})(window.jQuery);
