// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDKWleNq5ngVS8entLeb3KeNzcPDMiFK0Q",
    authDomain: "shiduchim-il.firebaseapp.com",
    databaseURL: "https://shiduchim-il-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "shiduchim-il",
    storageBucket: "shiduchim-il.firebasestorage.app",
    messagingSenderId: "691457274015",
    appId: "1:691457274015:web:7af6a612d44b04ccc1b2aa",
    measurementId: "G-G7KXRPB353"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database
const database = firebase.database();

// Function to toggle other occupation field
function toggleOtherOccupation() {
    const occupationSelect = document.getElementById('occupation');
    const otherOccupationGroup = document.getElementById('otherOccupationGroup');
    if (occupationSelect && otherOccupationGroup) {
        otherOccupationGroup.style.display = 
            occupationSelect.value === 'other' ? 'block' : 'none';
    }
}

// Convert number to Hebrew letters
function numberToHebrewLetters(num) {
    const letters = {
        1: 'א', 2: 'ב', 3: 'ג', 4: 'ד', 5: 'ה',
        6: 'ו', 7: 'ז', 8: 'ח', 9: 'ט', 10: 'י',
        11: 'יא', 12: 'יב', 13: 'יג', 14: 'יד', 15: 'טו',
        16: 'טז', 17: 'יז', 18: 'יח', 19: 'יט', 20: 'כ',
        21: 'כא', 22: 'כב', 23: 'כג', 24: 'כד', 25: 'כה',
        26: 'כו', 27: 'כז', 28: 'כח', 29: 'כט', 30: 'ל'
    };
    return letters[num] || num.toString();
}

// Convert number to Hebrew year
function numberToHebrewYear(num) {
    const thousands = Math.floor(num / 1000);
    const hundreds = Math.floor((num % 1000) / 100);
    const tens = Math.floor((num % 100) / 10);
    const ones = num % 10;

    const hebrewThousands = {
        5: 'ה',
        6: 'ו'
    };

    const hebrewHundreds = {
        1: 'ק', 2: 'ר', 3: 'ש', 4: 'ת', 5: 'תק',
        6: 'תר', 7: 'תש', 8: 'תת', 9: 'תתק'
    };

    const hebrewTens = {
        0: '', 1: 'י', 2: 'כ', 3: 'ל', 4: 'מ',
        5: 'נ', 6: 'ס', 7: 'ע', 8: 'פ', 9: 'צ'
    };

    const hebrewOnes = {
        0: '', 1: 'א', 2: 'ב', 3: 'ג', 4: 'ד',
        5: 'ה', 6: 'ו', 7: 'ז', 8: 'ח', 9: 'ט'
    };

    return (hebrewThousands[thousands] || '') +
           (hebrewHundreds[hundreds] || '') +
           (hebrewTens[tens] || '') +
           (hebrewOnes[ones] || '');
}

// Function to handle photo upload
function handlePhotoUpload(file) {
    const uploadArea = document.getElementById('photoUploadArea');
    if (!uploadArea) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        uploadArea.style.backgroundImage = `url(${e.target.result})`;
        uploadArea.style.backgroundSize = 'cover';
        uploadArea.style.backgroundPosition = 'center';
        uploadArea.innerHTML = '<div class="photo-overlay"><i class="fas fa-edit"></i> שינוי תמונה</div>';
    };
    reader.readAsDataURL(file);
}

// Function to show popup
function showPopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) {
        popup.style.display = 'block';
    }
}

// Function to close popup
function closePopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) {
        popup.style.display = 'none';
    }
}

// Function to update popup state
function updatePopupState(state) {
    const loadingState = document.getElementById('loadingState');
    const successState = document.getElementById('successState');
    const errorState = document.getElementById('errorState');

    if (loadingState) loadingState.style.display = state === 'loading' ? 'block' : 'none';
    if (successState) successState.style.display = state === 'success' ? 'block' : 'none';
    if (errorState) errorState.style.display = state === 'error' ? 'block' : 'none';
}

// Function to show error message
function showError(message) {
    const errorPopup = document.getElementById('errorPopup');
    const errorMessage = errorPopup.querySelector('p');
    if (errorMessage) {
        errorMessage.textContent = message;
    }
    errorPopup.classList.add('active');
}

// Function to validate form section
function validateSection(stepNumber) {
    const sections = document.getElementsByClassName('form-section');
    const currentSection = sections[stepNumber];
    if (!currentSection) return false;
    
    // Check if all required fields in the current section are filled
    const requiredFields = currentSection.querySelectorAll('input[required], select[required]');
    let isValid = true;
    let errorMessage = '';

    for (let field of requiredFields) {
        if (!field.checkValidity()) {
            isValid = false;
            const label = document.querySelector(`label[for="${field.id}"]`);
            const fieldName = label ? label.textContent : 'שדה';
            errorMessage = `אנא מלא ${fieldName}`;
            field.reportValidity();
            break;
        }
    }

    if (!isValid) {
        showError(errorMessage);
        return false;
    }
    return true;
}

// Function to handle form submission
async function handleSubmit(event) {
    event.preventDefault();
    
    const form = document.getElementById('matchmakingForm');
    if (!form.checkValidity()) {
        // Find the first invalid field
        const invalidField = form.querySelector(':invalid');
        if (invalidField) {
            const label = document.querySelector(`label[for="${invalidField.id}"]`);
            const fieldName = label ? label.textContent : 'שדה';
            showError(`אנא מלא ${fieldName}`);
            invalidField.focus();
        } else {
            showError('אנא מלא את כל השדות הנדרשים');
        }
        return;
    }

    // If form is valid, show loading popup
    showPopup('loadingPopup');
    
    try {
        // Get form data
        const formData = new FormData(event.target);
        const data = {};
        
        // Convert FormData to object, include all values
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Add timestamp
        data.timestamp = firebase.database.ServerValue.TIMESTAMP;

        // Save to Realtime Database
        const newMatchRef = database.ref('matches').push();
        await newMatchRef.set(data);

        // Show success state
        closePopup('loadingPopup');
        showPopup('successPopup');
        
        // Reset form after 2 seconds
        setTimeout(() => {
            event.target.reset();
            closePopup('successPopup');
            showSection(0); // Return to first section
        }, 2000);
        
    } catch (error) {
        console.error('Error submitting form:', error);
        // Show error state
        closePopup('loadingPopup');
        showError('אנא נסה שוב מאוחר יותר');
    }
}

// Function to validate section
function validateSection(stepNumber) {
    const sections = document.getElementsByClassName('form-section');
    const currentSection = sections[stepNumber];
    if (!currentSection) return false;
    
    // Check if all required fields in the current section are filled
    const requiredFields = currentSection.querySelectorAll('input[required], select[required]');
    let isValid = true;
    let errorMessage = '';

    for (let field of requiredFields) {
        if (!field.checkValidity()) {
            isValid = false;
            const label = document.querySelector(`label[for="${field.id}"]`);
            const fieldName = label ? label.textContent : 'שדה';
            errorMessage = `אנא מלא ${fieldName}`;
            field.reportValidity();
            break;
        }
    }

    if (!isValid) {
        showError(errorMessage);
        return false;
    }
    return true;
}

// Function to handle age validation
function validateAge() {
    const ageInput = document.getElementById('age');
    if (!ageInput) return true;

    if (!ageInput.checkValidity()) {
        ageInput.reportValidity();
        return false;
    }
    return true;
}

// Function to validate and set date restrictions
function setupDateValidation() {
    const gregorianDateInput = document.getElementById('gregorianBirthdate');
    const ageInput = document.getElementById('age');
    
    if (!gregorianDateInput || !ageInput) return;
    
    // Calculate minimum and maximum dates
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    
    // Set the min and max attributes
    gregorianDateInput.min = minDate.toISOString().split('T')[0];
    gregorianDateInput.max = maxDate.toISOString().split('T')[0];
    
    // Add validation on change
    gregorianDateInput.addEventListener('change', function() {
        if (!this.checkValidity()) {
            this.reportValidity();
            return;
        }

        const selectedDate = new Date(this.value);
        const age = calculateAge(selectedDate);
        
        if (age >= 18 && age <= 120) {
            ageInput.value = age;
        } else {
            this.value = '';
            ageInput.value = '';
        }
    });
}

// Calculate age from date
function calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

// Global variable for current step
let currentStep = 0;

// Function to show specific form section
function showSection(stepNumber) {
    const sections = document.getElementsByClassName('form-section');
    const dots = document.getElementsByClassName('nav-dot');
    const prevButton = document.querySelector('.prev-button');
    const nextButton = document.querySelector('.next-button');
    const submitButton = document.querySelector('.submit-button');
    const formNavigation = document.querySelector('.form-navigation');

    // Ensure stepNumber is within bounds
    stepNumber = Math.max(0, Math.min(stepNumber, sections.length - 1));

    // Update sections visibility
    Array.from(sections).forEach((section, index) => {
        section.style.display = index === stepNumber ? 'block' : 'none';
        if (index === stepNumber) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });

    // Update navigation dots
    Array.from(dots).forEach((dot, index) => {
        if (index <= stepNumber) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });

    // Update buttons visibility and position based on step number
    if (stepNumber === 0) {
        // First card - only show next button on the left
        prevButton.style.display = 'none';
        nextButton.style.display = 'block';
        submitButton.style.display = 'none';
        formNavigation.style.justifyContent = 'flex-start';
        nextButton.style.marginRight = 'auto';
        nextButton.style.marginLeft = '0';
    } else if (stepNumber === sections.length - 1) {
        // Last card - show prev on right and submit on left
        prevButton.style.display = 'block';
        nextButton.style.display = 'none';
        submitButton.style.display = 'block';
        formNavigation.style.justifyContent = 'space-between';
        prevButton.style.order = '1';
        submitButton.style.order = '2';
    } else {
        // Middle cards - show prev on right and next on left
        prevButton.style.display = 'block';
        nextButton.style.display = 'block';
        submitButton.style.display = 'none';
        formNavigation.style.justifyContent = 'space-between';
        prevButton.style.order = '1';
        nextButton.style.order = '2';
    }

    // Update current step
    currentStep = stepNumber;
}

// Function to go to next section
function nextSection() {
    const sections = document.getElementsByClassName('form-section');
    if (currentStep < sections.length - 1) {
        showSection(currentStep + 1);
    }
}

// Function to go to previous section
function prevSection() {
    if (currentStep > 0) {
        showSection(currentStep - 1);
    }
}

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('matchmakingForm');
    if (!form) return;

    // Initialize first section
    showSection(0);
    
    // Setup date validation
    setupDateValidation();

    // Add navigation button event listeners
    const prevButton = document.querySelector('.prev-button');
    const nextButton = document.querySelector('.next-button');

    if (prevButton) {
        prevButton.addEventListener('click', prevSection);
    }

    if (nextButton) {
        nextButton.addEventListener('click', nextSection);
    }

    // Add navigation dots functionality
    const dots = document.getElementsByClassName('nav-dot');
    Array.from(dots).forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSection(index);
        });
    });

    // Add form submit handler
    form.addEventListener('submit', handleSubmit);

    // Add form validation
    form.addEventListener('submit', function(event) {
        if (!validateAge()) {
            event.preventDefault();
        }
    });

    // Add validation for age input
    const ageInput = document.getElementById('age');
    if (ageInput) {
        ageInput.addEventListener('invalid', function(event) {
            event.preventDefault();
            if (!this.value) {
                showError('אנא הזן גיל');
            } else if (this.validity.rangeUnderflow) {
                showError('הגיל חייב להיות מעל 18');
            } else if (this.validity.rangeOverflow) {
                showError('הגיל חייב להיות מתחת ל-120');
            }
        });
    }
});

// Initialize Hebrew date selectors
const hebrewDaySelect = document.getElementById('hebrewDay');
if (hebrewDaySelect) {
    hebrewDaySelect.innerHTML = '<option value="">יום</option>';
    for(let i = 1; i <= 30; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = numberToHebrewLetters(i);
        hebrewDaySelect.appendChild(option);
    }
}

const hebrewYearSelect = document.getElementById('hebrewYear');
if (hebrewYearSelect) {
    hebrewYearSelect.innerHTML = '<option value="">שנה</option>';
    const startYear = 5750; // תש"ן
    const currentYear = new Date().getFullYear() + 3760;
    for(let i = startYear; i <= currentYear; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = numberToHebrewYear(i);
        hebrewYearSelect.appendChild(option);
    }
}

// Initialize photo upload
const uploadArea = document.getElementById('photoUploadArea');
const fileInput = document.getElementById('photo');
    
if (uploadArea && fileInput) {
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            handlePhotoUpload(files[0]);
        }
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handlePhotoUpload(e.target.files[0]);
        }
    });
}

// Popup functions
function showPopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) {
        popup.classList.add('active');
    }
}

function closePopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) {
        popup.classList.remove('active');
    }
}