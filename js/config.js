        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, doc, setDoc, onSnapshot, collection } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        const appId = typeof __app_id !== 'undefined' ? __app_id : 'ujianku-default-app';
        let db = null;
        let auth = null;
        let cloudUser = null;

        async function initCloudSync() {
            const badge = document.getElementById('cloud-sync-badge');
            try {
                if (typeof __firebase_config === 'undefined') {
                    if (badge) {
                        badge.className = "text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md";
                        badge.innerHTML = '<i class="fa-solid fa-hard-drive text-[9px]"></i> Lokal';
                    }
                    return;
                }

                const firebaseConfig = JSON.parse(__firebase_config);
                const app = initializeApp(firebaseConfig);
                auth = getAuth(app);
                db = getFirestore(app);

                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    const cred = await signInWithCustomToken(auth, __initial_auth_token);
                    cloudUser = cred.user;
                } else {
                    const cred = await signInAnonymously(auth);
                    cloudUser = cred.user;
                }

                if (!cloudUser) return;

                // Fungsi simpan state ke cloud agar tersinkron di HP siswa & laptop guru
                window.syncStateToCloud = async function(collectionName, itemsArray) {
                    if (!db || !cloudUser) return;
                    try {
                        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'ujianku_store', collectionName);
                        await setDoc(docRef, {
                            itemsJson: JSON.stringify(itemsArray),
                            updatedAt: Date.now()
                        });
                    } catch (err) {
                        console.warn('Cloud write deferred:', err);
                    }
                };

                // Dengarkan perubahan real-time dari perangkat lain (misal guru buat ujian di laptop -> langsung muncul di HP siswa)
                const storeCol = collection(db, 'artifacts', appId, 'public', 'data', 'ujianku_store');
                onSnapshot(storeCol, (snapshot) => {
                    snapshot.forEach((docSnap) => {
                        const key = docSnap.id;
                        const data = docSnap.data();
                        if (!data || !data.itemsJson) return;
                        try {
                            const parsed = JSON.parse(data.itemsJson);
                            if (typeof window.applyRemoteState === 'function') {
                                window.applyRemoteState(key, parsed);
                            }
                        } catch (e) {}
                    });

                    if (badge) {
                        badge.className = "text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-md flex items-center gap-1";
                        badge.innerHTML = '<i class="fa-solid fa-cloud-check text-[9px]"></i> Cloud Aktif';
                    }
                }, (error) => {
                    if (badge) {
                        badge.className = "text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md";
                        badge.innerHTML = '<i class="fa-solid fa-hard-drive text-[9px]"></i> Lokal';
                    }
                });
            } catch (e) {
                if (badge) {
                    badge.className = "text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md";
                    badge.innerHTML = '<i class="fa-solid fa-hard-drive text-[9px]"></i> Lokal';
                }
            }
        }

        initCloudSync();

//STATE DAN DEFAULT DATA
        const DEFAULT_TEACHERS = [
            { email: 'pak.ahmad@guru.sch.id', pass: 'guru123', name: 'Ahmad Fauzi, S.Kom.' }
        ];

        const DEFAULT_CLASSES = [
            {
                id: 'cls-1',
                name: 'XII IPA 1',
                teacherEmail: 'pak.ahmad@guru.sch.id',
                students: [
                    { email: 'budi@siswa.sch.id', name: 'Budi Santoso', absen: '01', pass: 'siswa123' },
                    { email: 'siti@siswa.sch.id', name: 'Siti Aminah', absen: '02', pass: 'siswa123' }
                ]
            }
        ];

        const DEFAULT_FOLDERS = [
            { id: 'fld-1', name: 'Evaluasi Semester Ganjil 2026', teacherEmail: 'pak.ahmad@guru.sch.id' }
        ];

        const DEFAULT_EXAMS = [
            {
                id: 'ex-1',
                folderId: 'fld-1',
                classId: 'cls-1',
                title: 'Ulangan Harian: Keamanan Web & Git',
                subject: 'Informatika',
                difficulty: 'Sedang',
                date: '2026-11-24',
                deadline: '2026-11-30T23:59',
                durationMinutes: 15,
                questions: [
                    {
                        id: 101,
                        question: "Apa fungsi utama dari Page Visibility API dalam pengembangan sistem ujian anti-curang berbasis web?",
                        options: [
                            "Mendeteksi saat pengguna berpindah tab atau meminimalkan peramban",
                            "Mengubah warna tema halaman secara otomatis saat malam hari",
                            "Mempercepat proses pengunduhan gambar pada halaman web",
                            "Menghapus riwayat penjelajahan siswa secara permanen"
                        ],
                        answer: "Mendeteksi saat pengguna berpindah tab atau meminimalkan peramban",
                        explanation: "Page Visibility API memicu event 'visibilitychange' saat tab peramban tidak lagi terlihat aktif."
                    },
                    {
                        id: 102,
                        question: "Perintah Git manakah yang digunakan untuk mengunggah commit lokal ke repositori remote GitHub?",
                        options: ["git push origin main", "git pull origin main", "git clone repository", "git init --remote"],
                        answer: "git push origin main",
                        explanation: "'git push' mengirimkan riwayat commit dari branch lokal ke server remote GitHub."
                    }
                ]
            }
        ];

        function loadData(key, fallback) {
            const data = localStorage.getItem('ujianku_' + key);
            return data ? JSON.parse(data) : fallback;
        }

        function saveData(key, val) {
            localStorage.setItem('ujianku_' + key, JSON.stringify(val));
            if (typeof window.syncStateToCloud === 'function') {
                window.syncStateToCloud(key, val);
            }
        }

        let teachers = loadData('teachers', DEFAULT_TEACHERS);
        let classes = loadData('classes', DEFAULT_CLASSES);
        let folders = loadData('folders', DEFAULT_FOLDERS);
        let exams = loadData('exams', DEFAULT_EXAMS);
        let submissions = loadData('submissions', []);
        let liveSessions = loadData('live', []);

        // Dipanggil otomatis saat ada pembaruan data dari perangkat lain (HP <-> Laptop)
        window.applyRemoteState = function(key, parsedItems) {
            if (!Array.isArray(parsedItems)) return;
            localStorage.setItem('ujianku_' + key, JSON.stringify(parsedItems));

            if (key === 'teachers') teachers = parsedItems;
            if (key === 'classes') {
                classes = parsedItems;
                checkUrlInvitation();
            }
            if (key === 'folders') folders = parsedItems;
            if (key === 'exams') exams = parsedItems;
            if (key === 'submissions') submissions = parsedItems;
            if (key === 'live') liveSessions = parsedItems;

            // Segarkan tampilan aktif secara otomatis tanpa mengganggu ujian yang sedang berjalan
            if (currentUser && !isExamActive) {
                if (currentUser.role === 'student') {
                    // Perbarui referensi kelas jika siswa baru didaftarkan guru dari perangkat lain
                    const myCls = classes.find(c => c.id === currentUser.classId) ||
                                  classes.find(c => c.students.some(s => s.email.toLowerCase() === currentUser.email.toLowerCase()));
                    if (myCls) {
                        currentUser.classId = myCls.id;
                        currentUser.className = myCls.name;
                    }
                    renderStudentPortal();
                } else if (currentUser.role === 'teacher') {
                    const liveTab = document.getElementById('teacher-tab-live');
                    const classTab = document.getElementById('teacher-tab-classes');
                    const reportTab = document.getElementById('teacher-tab-reports');
                    if (liveTab && !liveTab.classList.contains('hidden')) renderTeacherLiveExam();
                    if (classTab && !classTab.classList.contains('hidden')) renderTeacherClasses();
                    if (reportTab && !reportTab.classList.contains('hidden')) renderTeacherReports();
                }
            }
        };

        function persistAll() {
            saveData('teachers', teachers);
            saveData('classes', classes);
            saveData('folders', folders);
            saveData('exams', exams);
            saveData('submissions', submissions);
            saveData('live', liveSessions);
        }

        let currentUser = null;
        let selectedFolderId = folders.length > 0 ? folders[0].id : null;
        let selectedEditorExamId = exams.length > 0 ? exams[0].id : null;
        let invitedClassId = null;
