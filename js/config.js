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
