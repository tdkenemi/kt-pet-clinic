const axios = require('axios');

async function test() {
  try {
    // 1. Get admin token
    const loginRes = await axios.post('http://localhost:5000/api/users/login', {
      email: 'admin@ktclinic.com',
      password: 'password123'
    });
    const token = loginRes.data.token;

    // 2. Get users and pets
    const userRes = await axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } });
    const user = userRes.data.find(u => u.email === 'admin@ktclinic.com' || u.role === 'admin'); // or any user
    
    const petRes = await axios.get('http://localhost:5000/api/pets', { headers: { Authorization: `Bearer ${token}` } });
    const pet = petRes.data[0];

    // 3. Create appointment
    const reqBody = {
      userId: pet.ownerId,
      petId: pet._id,
      services: [{ name: 'Khám Tổng Quát', price: 150000 }],
      date: '2026-08-25',
      timeSlot: '09:00 - 10:00',
      reason: 'test',
      serviceLocation: 'clinic',
      homeAddress: '',
      adminPaymentOverride: 'Pending'
    };

    console.log("Sending:", reqBody);

    const res = await axios.post('http://localhost:5000/api/appointments', reqBody, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Success:", res.data);
  } catch (e) {
    console.error("Error:", e.response ? e.response.data : e.message);
  }
}

test();
