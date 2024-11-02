// Firebase Ayarları
const firebaseConfig = {
    apiKey: "AIzaSyBqvh9YjugTcuGGP1hKJjfo5FiRpy1fJFE",
    authDomain: "ghost-54304.firebaseapp.com",
    databaseURL: "https://ghost-54304-default-rtdb.firebaseio.com",
    projectId: "ghost-54304",
    storageBucket: "ghost-54304.appspot.com",
    messagingSenderId: "882897642019",
    appId: "1:882897642019:web:a4e544d9c8faf735d80796",
    measurementId: "G-2Y2TRT9XCF"
};

// Uygulamayı Başlat
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// تحقق من حالة تسجيل الدخول
if (!localStorage.getItem('loggedIn')) {
    document.getElementById('loginForm').style.display = 'block'; // عرض نموذج تسجيل الدخول
} else {
    document.getElementById('mainContent').classList.remove('hidden'); // عرض المحتوى الرئيسي
}

// إدارة تسجيل الدخول
document.getElementById('loginButton').addEventListener('click', function () {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // تحقق من بيانات المستخدم من Firebase Realtime Database
    database.ref('users').orderByChild('username').equalTo(username).once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                const userKey = Object.keys(userData)[0]; // الحصول على المفتاح
                if (userData[userKey].password === password) {
                    localStorage.setItem('loggedIn', 'true'); // حفظ حالة تسجيل الدخول
                    document.getElementById('loginForm').style.display = 'none'; // إخفاء نموذج تسجيل الدخول
                    document.getElementById('mainContent').classList.remove('hidden'); // عرض المحتوى الرئيسي
                } else {
                    document.getElementById('loginError').innerText = 'Kullanıcı adı veya şifre hatalı.';
                }
            } else {
                document.getElementById('loginError').innerText = 'Kullanıcı adı veya şifre hatalı.';
            }
        })
        .catch(error => {
            console.error('Hata:', error);
            document.getElementById('loginError').innerText = 'Bir hata oluştu.';
        });
});

// Araç plakasını doğrulama و temizleme fonksiyonu
function validateCarPlate(input) {
    const regex = /[^A-Za-z0-9]/g; 
    input.value = input.value.replace(regex, '').toUpperCase(); 
}

// Kilometre formatlama fonksiyonu
function formatMileage(input) {
    let value = input.value.replace(/,/g, '').replace(/\D/g, '');
    if (value.length > 6) value = value.slice(0, 6);
    const formattedValue = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'); 
    input.value = formattedValue;
}

// Veri kaydetme işlemi
document.getElementById('customerForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const carPlate = document.getElementById('carPlate').value;
    const mileage = document.getElementById('mileage').value;
    const maintenanceOptions = Array.from(document.getElementById('maintenanceOptions').selectedOptions).map(option => option.value);
    const additionalDetails = document.getElementById('additionalDetails').value;

    const newData = {
        carPlate,
        mileage,
        maintenanceOptions,
        additionalDetails,
    };

    // Veriyi Firebase'e kaydetme
    database.ref('customers/' + carPlate).set(newData)
        .then(() => {
            document.getElementById('message').innerText = 'Veri başarıyla kaydedildi.';
            document.getElementById('customerForm').reset(); // Formu sıfırlama
        })
        .catch(error => {
            console.error('Hata:', error);
            document.getElementById('error').innerText = 'Veri kaydetme sırasında bir hata oluştu.';
        });
});

// Araç plakasını arama
document.getElementById('searchButton').addEventListener('click', function () {
    const searchPlate = document.getElementById('searchPlate').value;

    // Veritabanında arama
    database.ref('customers/' + searchPlate).once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const resultDiv = document.getElementById('searchResult');
                resultDiv.innerHTML = `
                    <div>
                        <p><strong>Plaka:</strong> ${data.carPlate}</p>
                        <p><strong>KM:</strong> ${data.mileage}</p>
                        <p><strong>Bakım Seçenekleri:</strong> ${data.maintenanceOptions.join(', ')}</p>
                        <p><strong>Ek Detaylar:</strong> ${data.additionalDetails || 'Yok'}</p>
                    </div>`;
                resultDiv.classList.remove('hidden');
            } else {
                document.getElementById('searchResult').innerHTML = '<p>Bu plaka için veri bulunamadı.</p>';
            }
        })
        .catch(error => {
            console.error('Hata:', error);
            document.getElementById('searchResult').innerHTML = '<p>Arama sırasında bir hata oluştu.</p>';
        });
});

// Form geçişi ve arama görünürlüğü
document.getElementById('toggleFormButton').addEventListener('click', function () {
    const form = document.getElementById('customerForm');
    const isVisible = !form.classList.contains('hidden');
    form.classList.toggle('hidden', isVisible);
    document.getElementById('toggleSearchButton').classList.toggle('hidden', !isVisible);
});

document.getElementById('toggleSearchButton').addEventListener('click', function () {
    const searchSection = document.getElementById('searchPlate');
    const isVisible = !searchSection.classList.contains('hidden');
    searchSection.classList.toggle('hidden', isVisible);
    document.querySelector('h2.hidden').classList.toggle('hidden', !isVisible);
    document.getElementById('searchResult').classList.add('hidden'); // Önceki sonuçları gizle
});
