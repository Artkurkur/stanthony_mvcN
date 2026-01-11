let selectedProfilePicture = null;
let currentUserData = null;

// Placeholder image (empty profile)
const PLACEHOLDER_IMAGE = "../asset/smplProfile.jpg";

/* ================= AUTH ================= */
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
        localStorage.clear();
        window.location.href = 'login.html';
        return null;
    }
    return token;
}

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
}

/* ================= ROLE MAP ================= */
const ROLE_MAP = {
    1: 'Admin',
    2: 'Guest',
    3: 'Member',
    4: 'Organizer',
    5: 'Officer',
    6: 'School Staff',
    7: 'Cashier'
};

/* ================= LOAD PROFILE ================= */
async function loadUserProfile() {
    const token = checkAuth();
    if (!token) return;

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
        const response = await fetch(
            `http://localhost:8000/api/alumni/${user.member_id}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        if (!response.ok) throw new Error('Failed to load profile');

        const data = await response.json();
        const profile = data.user || data.data || data;
        currentUserData = profile;

        // VIEW MODE
        document.getElementById('name').value =
            `${profile.fname || ''} ${profile.lname || ''}`.trim();

        document.getElementById('batch').value =
            profile.batch_year || '';

        document.getElementById('phone').value =
            profile.mobile_number || '';

        document.getElementById('username').value =
            profile.username || '';

        // Map role_id to Name
        const roleName = ROLE_MAP[profile.role_id] || 'Member';
        document.getElementById('role').value = roleName;

        // PROFILE IMAGE
        const imageSrc = profile.profile_picture
            ? profile.profile_picture
            : PLACEHOLDER_IMAGE;

        document.getElementById('profileImage').src = imageSrc;
        document.getElementById('editProfileImage').src = imageSrc;

    } catch (err) {
        console.error(err);
    }
}

/* ================= VIEW ↔ EDIT MODE ================= */
function openEditMode() {
    document.querySelector('.main-banner').style.display = 'none';
    document.getElementById('editMode').style.display = 'block';

    if (!currentUserData) return;

    // Editable fields
    document.getElementById('firstName').readOnly = false;
    document.getElementById('lastName').readOnly = false;
    document.getElementById('batchYear').readOnly = false;

    document.getElementById('firstName').value = currentUserData.fname || '';
    document.getElementById('lastName').value = currentUserData.lname || '';
    document.getElementById('batchYear').value = currentUserData.batch_year || '';
    document.getElementById('phoneEdit').value = currentUserData.mobile_number || '';
    document.getElementById('usernameEdit').value = currentUserData.username || '';

    // Populate Role (ReadOnly)
    const roleName = ROLE_MAP[currentUserData.role_id] || 'Member';
    document.getElementById('roleEdit').value = roleName;
}

function closeEditMode() {
    document.getElementById('editMode').style.display = 'none';
    document.querySelector('.main-banner').style.display = 'flex';
}

/* ================= SAVE PROFILE ================= */
async function saveProfile(e) {
    e.preventDefault();

    const token = checkAuth();
    if (!token || !currentUserData) return;

    const user = JSON.parse(localStorage.getItem('user'));
    const formData = new FormData();

    // Compare fields — only append changed ones
    const fields = [
        { id: 'firstName', key: 'fname', original: currentUserData.fname },
        { id: 'lastName', key: 'lname', original: currentUserData.lname },
        { id: 'batchYear', key: 'batch_year', original: currentUserData.batch_year },
        { id: 'phoneEdit', key: 'mobile_number', original: currentUserData.mobile_number },
        { id: 'usernameEdit', key: 'username', original: currentUserData.username }
    ];

    fields.forEach(field => {
        const value = document.getElementById(field.id).value.trim();
        if (value !== String(field.original || '')) {
            formData.append(field.key, value);
        }
    });

    // Profile picture (only if changed)
    if (selectedProfilePicture) {
        formData.append('profile_picture', selectedProfilePicture);
    }

    // Nothing changed
    if ([...formData.keys()].length === 0) {
        closeEditMode();
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:8000/api/alumni/${user.member_id}`,
            {
                method: 'POST', // Use POST for FormData updates
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            }
        );

        if (!response.ok) throw new Error('Update failed');

        await response.json();
        selectedProfilePicture = null;

        alert('Profile updated successfully!');
        closeEditMode();
        loadUserProfile();

    } catch (err) {
        console.error(err);
    }
}

/* ================= DOM READY ================= */
document.addEventListener('DOMContentLoaded', () => {

    loadUserProfile();

    document.getElementById('updateBtn')
        .addEventListener('click', openEditMode);

    document.getElementById('cancelBtn')
        .addEventListener('click', closeEditMode);

    document.querySelector('.edit-mode form')
        .addEventListener('submit', saveProfile);

    document.getElementById('changePictureBtn')
        .addEventListener('click', () => {
            document.getElementById('profilePictureInput').click();
        });

    document.getElementById('profilePictureInput')
        .addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file || !file.type.startsWith('image/')) return;

            selectedProfilePicture = file;

            const reader = new FileReader();
            reader.onload = () => {
                document.getElementById('editProfileImage').src = reader.result;
            };
            reader.readAsDataURL(file);
        });
});
