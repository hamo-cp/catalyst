# Catalyst — Foundation Sprint

## 1. الهدف

هدف الـFoundation Sprint هو **تثبيت الأساس المعماري الذي سيُبنى عليه Catalyst لاحقًا، بدون توسيع المنتج**.

الناتج المطلوب ليس Feature جديدة، بل مجموعة artifacts وقرارات قابلة للمراجعة تثبت:

- حدود الطبقات والمسؤوليات.
- مصدر الحقيقة لحالة المتعلم.
- عقد حالة الامتحان والمحاولة والنتيجة.
- قواعد جودة البيانات التعليمية والامتحانية.
- حدود persistence وقرار تأجيل IndexedDB.
- معايير التحقق التي تمنع الانتقال إلى v2 قبل أن تصبح الأساسات قابلة للاختبار.

## 2. غير مشمول صراحةً (Non-goals)

هذا الـSprint لا يشمل:

- بناء `LearnerStore` فعليًا.
- إدخال IndexedDB.
- إعادة هيكلة modules أو نقل ملفات production.
- إضافة Learning/Practice/Exam features.
- تفعيل Exam Center للعامة.
- إعادة تصميم Home أو Navigation.
- إعادة بناء Service Worker بالكامل.
- إدخال dependencies جديدة.
- تنظيف `archive/` فعليًا.
- تغيير schema بيانات الإنتاج لمجرد تنفيذ الـSprint.

## 3. مسارات العمل F1 → F5

### F1 — Architecture Baseline & Boundaries

**الهدف:** تثبيت وصف واحد للحالة الحالية والهدف المعماري وحدود المسؤوليات.

**المخرجات:**

- `docs/architecture-baseline-v2.md`.
- تعريف الطبقات الحالية والمستهدفة.
- قواعد ممنوع/مسموح تمنع architectural drift.
- تحديد صريح للفصل بين UI state وdomain state وpersistence.

**معايير القبول:**

- الوثيقة تميز بوضوح بين current state وtarget state.
- كل قاعدة معمارية قابلة للتحقق من كود أو artifact مستقبلي.
- لا تتطلب المعايير أي refactor لتنفيذها في هذا الـSprint.

---

### F2 — Canonical Learner State Contract

**الهدف:** تعريف ما تعنيه "حالة المتعلم" في Catalyst قبل بناء store.

**المخرجات:**

- تعريف canonical learner state على مستوى domain.
- تحديد البيانات التي تمثل facts دائمة نسبيًا مقابل transient UI state.
- تحديد مصادر القراءة والكتابة المسموح بها على المستوى المفاهيمي.
- خطة `LearnerStore` مستقبلية كـcontract فقط، دون implementation.

**معايير القبول:**

- يمكن تسمية كل حقيقة مشتركة تخص المتعلم ومكانها المنطقي.
- لا توجد حقيقة learner واحدة موصوفة كمصدر canonical في أكثر من مكان.
- لا يوجد كود `LearnerStore` مضاف في هذا الـSprint.
- العقد مستقل عن IndexedDB أو أي storage engine محدد.

---

### F3 — Exam State & Exam-Line Contract

**الهدف:** تثبيت الخط المعماري لحالة الامتحان من اختيار المادة/الجلسة حتى النتيجة والتحليل.

**المخرجات:**

- تعريف واضح للـquestion/attempt/session/result ككيانات منفصلة منطقيًا.
- تحديد أين تقع مسؤولية selection، delivery، grading، analytics.
- تثبيت شرط عدم اعتبار البيانات غير الموثوقة قابلة للـauto-grading.
- توثيق وضع Exam Center الحالي: موجود معماريًا لكنه غير public.

**معايير القبول:**

- يمكن تتبع lifecycle المحاولة دون الرجوع إلى UI كـsource of truth.
- grading وanalytics لا يُعرّفان كجزء من presentation layer.
- manual-review path واضح ومذكور.
- لا يتم تفعيل Exam Center ضمن الـSprint.

---

### F4 — Data Quality & Persistence Decision

**الهدف:** حماية الـlearning/exam data من التحول إلى مصدر غير موثوق، مع إبقاء persistence بسيطة حتى تثبيت الـcontracts.

**المخرجات:**

- توثيق metadata/quality gates المستخدمة حاليًا للأسئلة والبيانات الحساسة.
- تحديد ما يجب اعتباره trusted قبل auto-grading أو analytics.
- قرار رسمي: IndexedDB مؤجل، وليس جزءًا من Foundation Sprint.
- تعريف persistence adapter كمفهوم مستقبلي لا كتنفيذ.

**معايير القبول:**

- أي claim بأن سؤالًا قابل للـauto-grade يمكن ربطه بقاعدة موثوقية موثقة.
- الحالات التي تحتاج manual review ليست مماثلة للحالات الموثوقة.
- لا توجد dependency جديدة لإدخال storage engine.
- قرار IndexedDB يمكن تفسيره من خلال متطلبات مثبتة، وليس تفضيلًا تقنيًا مجردًا.

---

### F5 — Verification, Testability & v2 Gate

**الهدف:** تحويل Foundation Sprint من وثائق نظرية إلى baseline يمكن التحقق منه وإغلاقه قبل v2.

**المخرجات:**

- قائمة safe checks قابلة للتكرار دون dependency churn.
- معايير قبول قابلة للتحقق من repository/artifacts.
- قائمة المخاطر المفتوحة التي تمنع أو تقيد v2.
- قرار جاهزية واضح: Foundation complete / not complete.

**معايير القبول:**

- كل artifact أساسي يمكن فحصه دون تعديل production behavior.
- `git diff --check` يمر على التغييرات التوثيقية.
- حالة working tree والتغييرات موثقة.
- لا يتم الادعاء بأن test suite نجح ما لم يكن موجودًا وقابلًا للتشغيل فعليًا.
- لا يُعلن v2-ready قبل إغلاق شروط baseline وlearner-state وexam-state.

## 4. ترتيب التنفيذ

الترتيب المقترح:

`F1 → F2 → F3 → F4 → F5`

السبب: لا يمكن تثبيت learner state قبل تعريف الحدود، ولا يمكن تثبيت exam state قبل معرفة مصدر الحقيقة، ولا يمكن اتخاذ قرار persistence قبل معرفة ما الذي نحتاج إلى حفظه، ولا يمكن إعلان v2 readiness قبل التحقق من هذه العقود.

## 5. تعريف الإنجاز

Foundation Sprint مكتمل عندما تكون الوثيقتان الأساسيتان موجودتين، والعقود السابقة قابلة للمراجعة، ولا توجد تغييرات production غير مبررة، ولا توجد dependencies جديدة، وتكون نتيجة الفحوصات الآمنة موثقة.

**مهم:** إكمال الـFoundation Sprint لا يعني أن Catalyst أصبح v2. يعني فقط أن المشروع أصبح يملك أساسًا معماريًا موثقًا يسمح باتخاذ قرار v2 بثقة أعلى.

## 6. المخاطر المفتوحة بعد الـSprint

- احتمال استمرار ازدواجية الحالة بين بعض feature modules حتى يتم تنفيذ الـcontracts لاحقًا.
- عدم حسم قرار تفعيل Exam Center قبل اكتمال مراجعة المنتج والمحتوى.
- مخاطر stale/offline data ما زالت تحتاج hardening مستقلًا في مرحلة لاحقة.
- repository hygiene ما زال قرارًا تنفيذيًا منفصلًا عن هذا الـSprint.
- ضعف الاختبارات الحالية يعني أن baseline لا يساوي إثباتًا كاملًا لصحة runtime behavior.
