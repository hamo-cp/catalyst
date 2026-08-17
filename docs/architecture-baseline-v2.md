# Catalyst — Architecture Baseline v2

## 1. قرار تنفيذي

Catalyst يدخل مرحلة **Foundation / Consolidation** وليس Feature Expansion.

القرار لهذه المرحلة هو تثبيت حدود النظام، توضيح تدفق البيانات والحالة، وتوثيق العقود المعمارية قبل أي إعادة هيكلة أو إضافة نظام جديد.

- لا توجد Feature جديدة في هذا التسليم.
- لا توجد إعادة هيكلة لكود الإنتاج.
- لا يوجد تنفيذ لـ `LearnerStore` الآن؛ يتم توثيق العقد والخطة فقط.
- لا يتم اعتماد IndexedDB في هذه المرحلة.
- Exam Center يبقى معماريًا موجودًا لكنه غير مفعل للعامة؛ لا نعتبر وجوده في الكود دليلًا على اكتمال المنتج.

## 2. الحالة الحالية التي يثبتها المستودع

Catalyst الحالي تطبيق PWA modular يحتوي على مجالات تعلم وتدريب وامتحانات، إضافة إلى routing وstate وطبقة بيانات وoffline support. يوجد أيضًا `archive/` واسع يحتوي على snapshots تاريخية.

الملاحظة الحاكمة: **الوضع الحالي ليس هو الـtarget architecture**. وجود modules كثيرة لا يعني أن حدودها وعقودها قد تم تثبيتها نهائيًا.

## 3. نموذج الطبقات الحالي

النموذج الحالي يُفهم عمليًا كالتالي:

```text
Presentation / UI
    ↓
Routing + View/Render orchestration
    ↓
Application state / interaction state
    ↓
Feature modules
    ├─ Learning
    ├─ Practice
    └─ Exam
    ↓
Data / datasets / normalization / validation
    ↓
Browser platform
    ├─ local persistence
    ├─ Service Worker / Cache
    └─ PWA runtime
```

هذا وصف للحالة الحالية، وليس أمرًا بإعادة ترتيب الملفات.

## 4. نموذج الطبقات المستهدف

الهدف المعماري للمرحلة التالية هو تثبيت فصل المسؤوليات قبل أي refactor:

```text
UI / Presentation
    ↓
Application orchestration
    ↓
Domain services / learning & exam engines
    ↓
Canonical learner state + domain data contracts
    ↓
Persistence adapter
    ↓
Platform storage / PWA cache
```

قواعد هذا النموذج:

1. الـUI لا يصبح مصدر الحقيقة لحالة المتعلم.
2. Feature modules لا تقرأ أو تكتب persistence بشكل عشوائي.
3. Exam grading يعتمد على بيانات سؤال موثوقة وعقد grading واضح.
4. الـService Worker مسؤول عن cache/runtime delivery وليس عن منطق التعلم.
5. طبقة persistence يجب أن تكون قابلة للاستبدال؛ لا يتم ربط domain logic مباشرة بـIndexedDB أو API محدد.

## 5. قواعد معمارية — ممنوع ومسموح

### ممنوع

- إضافة Feature جديدة لتجاوز مشكلة في architecture.
- إنشاء state مستقل لنفس حقيقة المتعلم داخل أكثر من module.
- جعل UI state هو المصدر canonical للتقدم أو سجل المحاولات.
- كتابة persistence مباشرة من كل feature module.
- إدخال IndexedDB قبل وجود حاجة مثبتة وعقد persistence واضحة.
- جعل Exam Center يعتمد على بيانات غير موثوقة باعتبارها auto-gradable.
- خلط cache invalidation مع domain logic.
- إعادة بناء التطبيق أو نقل الملفات لمجرد تحسين شكلي أثناء Foundation Sprint.

### مسموح

- توثيق contracts والحدود بين الطبقات.
- إضافة اختبارات أو فحوصات لا تحتاج dependencies جديدة عندما تكون آمنة ولا تغيّر runtime behavior.
- إضافة documentation links أو comments صغيرة جدًا إذا كانت لازمة لفهم العقد المعماري.
- تحسين validation في مرحلة لاحقة بعد تثبيت contract، وليس كجزء من هذا التسليم.
- استخدام adapter abstraction للتخزين عندما يبدأ تنفيذ LearnerStore لاحقًا.

## 6. خط حال الامتحانات

Exam Center هو **architectural capability موجودة وليست public product surface مكتملة**.

المستودع يحتوي على بنية Question Player وMock Engine وWorked Examples وAnalytics وطبقات بيانات/normalization وmetadata خاصة بجودة المصدر. في المقابل، يجب أن يظل نشر السؤال أو auto-grading مشروطًا بموثوقية البيانات.

الحالة المعمارية المطلوبة قبل التفعيل العام:

- عقد موحد للسؤال والـattempt والـresult.
- مصدر واضح للحقيقة الخاصة بحالة الجلسة.
- فصل grading عن presentation.
- مسار صريح للأسئلة التي تحتاج manual review.
- قابلية تتبع النتيجة إلى نسخة البيانات التي بُني عليها التقييم.

لا يقرر هذا المستند تفعيل Exam Center؛ القرار المنتجّي يأتي بعد استكمال مراجعة المحتوى والتجربة.

## 7. مفهوم حالة المتعلم الموحدة

نريد لاحقًا **Canonical Learner State** واحدًا يمثل الحقائق المشتركة التي تحتاجها وحدات التعلم والتدريب والامتحانات.

المفهوم يشمل، على مستوى العقد لا التنفيذ:

- الهوية المنطقية للمستخدم/الجلسة المحلية.
- التقدم في المحتوى.
- إكمال الوحدات والأقسام.
- سجل المحاولات والنتائج.
- الأخطاء/المفاهيم التي ظهر فيها ضعف.
- بيانات التعلم التكيفي اللازمة لاتخاذ القرار.
- ملخصات الأداء المطلوبة للـanalytics.
- version/schema metadata تسمح بتطور الحالة بأمان.

لا يجوز أن تصبح هذه الوثيقة تفويضًا لبناء store كبير الآن. المطلوب أولًا تحديد **ما هي الحقيقة canonical وما الذي يظل transient UI state**.

## 8. قرار عدم اعتماد IndexedDB الآن

**IndexedDB غير معتمد في Foundation Sprint.**

السبب ليس أنه تقنية سيئة، بل لأن إدخاله الآن سيضيف persistence complexity قبل تثبيت نموذج حالة المتعلم وعقود القراءة/الكتابة.

القرار:

- الاستمرار مؤقتًا مع آليات التخزين الحالية الموجودة في التطبيق.
- تصميم `LearnerStore` مستقبلًا خلف abstraction.
- عدم ربط الـdomain مباشرة بـIndexedDB.
- إعادة تقييم IndexedDB عندما تصبح متطلبات حجم البيانات، الاستعلامات، durability، أو offline learner history مثبتة وقابلة للقياس.

## 9. تقييم جاهزية v2

**الحالة: Not Ready for v2 implementation yet.**

Catalyst يملك قاعدة قوية تسمح بالتخطيط لـv2، لكنه يحتاج Foundation Sprint قبل أن يصبح من الحكمة تنفيذ v2 على نطاق واسع.

### شروط الجاهزية

- baseline معماري معتمد ومفهوم.
- boundaries بين UI/application/domain/data واضحة.
- canonical learner state contract موثق.
- خطة LearnerStore موثقة دون implementation مبكر.
- exam state/attempt/result contracts محددة.
- content-quality gates واضحة.
- safe checks/tests قابلة للتكرار دون dependency churn.
- قرار واضح بشأن حدود v2 وnon-goals.

## 10. معيار نجاح هذا الـBaseline

يُعد هذا المستند ناجحًا عندما يستطيع مهندس آخر قراءة الوثيقة وتحديد:

1. أين توجد مسؤولية كل طبقة.
2. أين يجب أن تعيش حالة المتعلم.
3. ما الذي لا يجوز أن يفعله الـUI أو الـfeature modules.
4. لماذا لا نستخدم IndexedDB الآن.
5. ما الذي ينقص Exam Center قبل اعتباره جاهزًا للنشر.
6. لماذا لا يبدأ تنفيذ v2 قبل إغلاق Foundation Sprint.
