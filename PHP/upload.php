<?php
// upload.php – שמירה של טופס העלאה ל-DB + העלאת קובץ
// ריצה: דרך שרת PHP (למשל XAMPP/WAMP) ולא דרך file:


require_once __DIR__ . '/db.php';

function redirectBack($msg, $ok=false){
  // מחזיר לדף האזור האישי עם הודעה
  $qs = http_build_query([
    'status' => $ok ? 'ok' : 'bad',
    'msg' => $msg,
  ]);
  header('Location: ../my.html?' . $qs);
  exit;
}

if($_SERVER['REQUEST_METHOD'] !== 'POST'){
  redirectBack('שגיאה: גישה לא תקינה לטופס.');
}

// ניקוי בסיסי
$title = trim($_POST['contentTitle'] ?? '');
$type = trim($_POST['contentType'] ?? '');
$institution = trim($_POST['institution'] ?? '');
$degree = trim($_POST['degree'] ?? '');
$course = trim($_POST['course'] ?? '');
$semester = trim($_POST['semester'] ?? '');
$description = trim($_POST['description'] ?? '');

// ולידציות (שרת) – לפחות כמו ה-Client
if(mb_strlen($title) < 6 || preg_match('/^\d+$/u', $title)){
  redirectBack('כותרת חייבת להיות לפחות 6 תווים ולא רק מספרים.');
}
if(mb_strlen($course) < 3 || preg_match('/^\d+$/u', $course)){
  redirectBack('שם קורס חייב להיות לפחות 3 תווים ולא רק מספרים.');
}
if(mb_strlen($description) < 20){
  redirectBack('תיאור חייב להיות לפחות 20 תווים.');
}

$allowedTypes = ['summary','exercise','solution'];
if(!in_array($type, $allowedTypes, true)){
  redirectBack('סוג חומר לא תקין.');
}

$required = [$institution,$degree,$semester];
foreach($required as $v){
  if($v === '') redirectBack('נא למלא את כל שדות החובה.');
}

// קובץ
if(!isset($_FILES['fileUpload']) || $_FILES['fileUpload']['error'] !== UPLOAD_ERR_OK){
  redirectBack('חובה לצרף קובץ PDF תקין.');
}

$f = $_FILES['fileUpload'];
$max = 10 * 1024 * 1024; // 10MB
if($f['size'] > $max){
  redirectBack('הקובץ גדול מדי (מומלץ עד 10MB).');
}

// בדיקת PDF לפי סיומת + mime (בטוח גם בלי fileinfo)
$ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));

$mime = '';
if (class_exists('finfo')) {
  $finfo = new finfo(FILEINFO_MIME_TYPE);
  $mime = $finfo->file($f['tmp_name']);
} elseif (function_exists('mime_content_type')) {
  $mime = mime_content_type($f['tmp_name']);
}

// אם אין אפשרות לבדוק MIME — לא מפילים את השרת
$mimeOk = ($mime === 'application/pdf') || ($mime === 'application/octet-stream') || ($mime === '');

if ($ext !== 'pdf' || !$mimeOk) {
  redirectBack('ניתן להעלות PDF בלבד.');
}


// שמירת קובץ
$uploadsDir = realpath(__DIR__ . '/../Uploads');
if(!$uploadsDir){
  redirectBack('תיקיית Uploads חסרה בפרויקט.');
}

$safeBase = preg_replace('/[^a-zA-Z0-9_-]+/', '-', pathinfo($f['name'], PATHINFO_FILENAME));
$safeBase = trim($safeBase, '-');
if($safeBase === '') $safeBase = 'file';

$filename = $safeBase . '-' . date('Ymd-His') . '-' . bin2hex(random_bytes(3)) . '.pdf';
$target = $uploadsDir . DIRECTORY_SEPARATOR . $filename;

if(!move_uploaded_file($f['tmp_name'], $target)){
  redirectBack('שגיאה בהעלאת הקובץ.');
}

// שמירה ב-DB
try {
  $stmt = $pdo->prepare(
    'INSERT INTO uploads
      (title, content_type, institution, degree, course, semester, description, file_path, created_at)
     VALUES
      (:title, :content_type, :institution, :degree, :course, :semester, :description, :file_path, NOW())'
  );

  $stmt->execute([
    ':title' => $title,
    ':content_type' => $type,
    ':institution' => $institution,
    ':degree' => $degree,
    ':course' => $course,
    ':semester' => $semester,
    ':description' => $description,
    ':file_path' => 'Uploads/' . $filename,
  ]);

  redirectBack('החומר נשמר בהצלחה!', true);

} catch (Throwable $e) {
  // ניקוי קובץ במקרה של כשל DB
  @unlink($target);
  redirectBack('שגיאה בשמירה ל-DB. בדקי שהטבלה קיימת ושפרטי ההתחברות נכונים.');
}
