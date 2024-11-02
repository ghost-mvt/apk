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
    document.getElementById('loginForm').style.display = 'block';
} else {
    document.getElementById('mainContent').classList.remove('hidden');
}

// إدارة تسجيل الدخول
document.getElementById('loginButton').addEventListener('click', function () {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    database.ref('users').orderByChild('username').equalTo(username).once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                const userKey = Object.keys(userData)[0];
                if (userData[userKey].password === password) {
                    localStorage.setItem('loggedIn', 'true');
                    document.getElementById('loginForm').style.display = 'none';
                    document.getElementById('mainContent').classList.remove('hidden');
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

// Araç plakasını doğrulama
function validateCarPlate(input) {
    const regex = /[^A-Za-z0-9]/g;
    input.value = input.value.replace(regex, '').toUpperCase();
}

// Kilometre formatlama
function formatMileage(input) {
    let value = input.value.replace(/,/g, '').replace(/\D/g, '');
    if (value.length > 6) value = value.slice(0, 6);
    const formattedValue = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    input.value = formattedValue;
}

// Müşteri Verilerini Kaydetme
document.getElementById('customerForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const selectedOptions = Array.from(document.getElementById('maintenanceOptions').selectedOptions);
    if (selectedOptions.length === 0) {
        document.getElementById('error').innerText = 'En az bir bakım türü seçmelisiniz.';
        return;
    } else {
        document.getElementById('error').innerText = '';
    }

    const carPlate = document.getElementById('carPlate').value;
    const mileage = document.getElementById('mileage').value.replace(/,/g, '');
    const maintenanceOptions = selectedOptions.map(option => option.value);
    const additionalDetails = document.getElementById('additionalDetails').value;

    const currentDate = new Date().toLocaleDateString();

    // Verileri Firebase'e kaydet
    const newEntryRef = database.ref('customers').push();
    newEntryRef.set({
        carPlate: carPlate,
        mileage: mileage,
        maintenanceOptions: maintenanceOptions,
        additionalDetails: additionalDetails,
        date: currentDate
    })
    .then(() => {
        document.getElementById('message').innerText = 'Veri başarıyla kaydedildi!';
        document.getElementById('customerForm').reset();
    })
    .catch(error => {
        console.error('Hata:', error);
        document.getElementById('error').innerText = 'Veri kaydetme sırasında bir hata oluştu.';
    });
});

// Araç Plakasıyla Arama
document.getElementById('toggleSearchButton').addEventListener('click', function () {
    const searchPlateInput = document.getElementById('searchPlate');
    searchPlateInput.classList.toggle('hidden');
    this.classList.toggle('hidden');
    document.querySelector('h2.hidden').classList.toggle('hidden');
    document.getElementById('searchResult').classList.add('hidden');
});

document.getElementById('searchButton').addEventListener('click', function () {
    const searchPlate = document.getElementById('searchPlate').value.toUpperCase();
    const searchResultDiv = document.getElementById('searchResult');

    if (!searchPlate) {
        alert('Lütfen bir plaka girin.');
        return;
    }

    database.ref('customers').orderByChild('carPlate').equalTo(searchPlate).once('value')
        .then(snapshot => {
            searchResultDiv.innerHTML = '';
            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const data = childSnapshot.val();
                    const resultDiv = document.createElement('div');
                    resultDiv.innerHTML = `
                        <strong>Plaka:</strong> ${data.carPlate}<br>
                        <strong>KM:</strong> ${data.mileage}<br>
                        <strong>Bakım Türleri:</strong> ${data.maintenanceOptions.join(', ')}<br>
                        <strong>Ek Detaylar:</strong> ${data.additionalDetails || 'Yok'}<br>
                        <strong>Tarih:</strong> ${data.date}
                    `;
                    searchResultDiv.appendChild(resultDiv);
                });
                searchResultDiv.classList.remove('hidden');
            } else {
                searchResultDiv.innerHTML = 'Bu plaka ile ilgili kayıt bulunamadı.';
                searchResultDiv.classList.remove('hidden');
            }
        })
        .catch(error => {
            console.error('Hata:', error);
            alert('Arama sırasında bir hata oluştu.');
        });
});
