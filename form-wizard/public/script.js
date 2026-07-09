class FormWizard {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 3;
    this.formData = {
      name: '',
      email: '',
      plan: ''
    };
    this.init();
  }

  init() {
    this.cacheElements();
    this.attachEventListeners();
    this.loadFormData();
  }

  cacheElements() {
    this.form = document.getElementById('wizardForm');
    this.backBtn = document.getElementById('backBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.submitBtn = document.getElementById('submitBtn');
    this.progressFill = document.getElementById('progressFill');
    this.formSteps = document.querySelectorAll('.form-step');
    this.stepDots = document.querySelectorAll('.step-dot');
    this.stepLabels = document.querySelectorAll('.step-label');
    this.successMessage = document.getElementById('successMessage');
  }

  attachEventListeners() {
    this.nextBtn.addEventListener('click', (e) => this.handleNext(e));
    this.backBtn.addEventListener('click', (e) => this.handleBack(e));
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.stepDots.forEach(dot => {
      dot.addEventListener('click', (e) => this.jumpToStep(e));
    });
  }

  handleNext(e) {
    e.preventDefault();

    if (!this.validateCurrentStep()) {
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.saveStepData();
      this.currentStep++;
      this.updateUI();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  handleBack(e) {
    e.preventDefault();

    if (this.currentStep > 1) {
      this.saveStepData();
      this.currentStep--;
      this.updateUI();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    if (!this.validateCurrentStep()) {
      return;
    }

    this.saveStepData();
    this.submitForm();
  }

  validateCurrentStep() {
    this.clearErrors();

    if (this.currentStep === 1) {
      return this.validateStep1();
    } else if (this.currentStep === 2) {
      return this.validateStep2();
    }

    return true;
  }

  validateStep1() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    let isValid = true;

    if (!name) {
      this.showError('nameError', 'Please enter your name');
      isValid = false;
    }

    if (!email) {
      this.showError('emailError', 'Please enter your email');
      isValid = false;
    } else if (!this.isValidEmail(email)) {
      this.showError('emailError', 'Please enter a valid email address');
      isValid = false;
    }

    return isValid;
  }

  validateStep2() {
    const planChecked = document.querySelector('input[name="plan"]:checked');

    if (!planChecked) {
      this.showError('planError', 'Please select a plan');
      return false;
    }

    return true;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => {
      el.textContent = '';
    });
  }

  saveStepData() {
    if (this.currentStep === 1) {
      this.formData.name = document.getElementById('name').value;
      this.formData.email = document.getElementById('email').value;
    } else if (this.currentStep === 2) {
      const planChecked = document.querySelector('input[name="plan"]:checked');
      if (planChecked) {
        this.formData.plan = planChecked.value;
      }
    }

    this.saveToLocalStorage();
  }

  saveToLocalStorage() {
    localStorage.setItem('wizardFormData', JSON.stringify(this.formData));
  }

  loadFormData() {
    const saved = localStorage.getItem('wizardFormData');
    if (saved) {
      this.formData = JSON.parse(saved);
      this.populateFormWithData();
    }
  }

  populateFormWithData() {
    if (this.formData.name) {
      document.getElementById('name').value = this.formData.name;
    }
    if (this.formData.email) {
      document.getElementById('email').value = this.formData.email;
    }
    if (this.formData.plan) {
      const planInput = document.getElementById(`plan-${this.formData.plan}`);
      if (planInput) {
        planInput.checked = true;
      }
    }
  }

  jumpToStep(e) {
    const targetStep = parseInt(e.target.dataset.step);

    // Only allow jumping backward or to current step
    if (targetStep > this.currentStep) {
      alert('Please complete the current step first');
      return;
    }

    if (targetStep < this.currentStep) {
      this.saveStepData();
      this.currentStep = targetStep;
      this.updateUI();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  updateUI() {
    this.updateFormSteps();
    this.updateProgressBar();
    this.updateButtons();
    this.updateStepIndicators();

    if (this.currentStep === 3) {
      this.updateSummary();
    }
  }

  updateFormSteps() {
    this.formSteps.forEach((step, index) => {
      const stepNumber = index + 1;
      if (stepNumber === this.currentStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }

  updateProgressBar() {
    const percentage = (this.currentStep / this.totalSteps) * 100;
    this.progressFill.style.width = percentage + '%';
  }

  updateButtons() {
    // Show/hide back button
    if (this.currentStep === 1) {
      this.backBtn.style.display = 'none';
    } else {
      this.backBtn.style.display = 'block';
    }

    // Show/hide next and submit buttons
    if (this.currentStep === this.totalSteps) {
      this.nextBtn.style.display = 'none';
      this.submitBtn.style.display = 'block';
    } else {
      this.nextBtn.style.display = 'block';
      this.submitBtn.style.display = 'none';
    }
  }

  updateStepIndicators() {
    this.stepDots.forEach((dot, index) => {
      const stepNumber = index + 1;
      dot.classList.remove('active', 'completed');

      if (stepNumber === this.currentStep) {
        dot.classList.add('active');
      } else if (stepNumber < this.currentStep) {
        dot.classList.add('completed');
      }
    });

    this.stepLabels.forEach((label, index) => {
      const stepNumber = index + 1;
      if (stepNumber === this.currentStep) {
        label.classList.add('active');
      } else {
        label.classList.remove('active');
      }
    });
  }

  updateSummary() {
    const planPrices = {
      basic: '$9/month',
      professional: '$29/month',
      enterprise: 'Custom'
    };

    const planNames = {
      basic: 'Basic',
      professional: 'Professional',
      enterprise: 'Enterprise'
    };

    document.getElementById('summaryName').textContent = this.formData.name;
    document.getElementById('summaryEmail').textContent = this.formData.email;
    document.getElementById('summaryPlan').textContent =
      planNames[this.formData.plan] || '-';
    document.getElementById('summaryPrice').textContent =
      planPrices[this.formData.plan] || '-';
  }

  submitForm() {
    this.nextBtn.disabled = true;
    this.submitBtn.disabled = true;

    fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.formData)
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.error || 'Submission failed');
          });
        }
        return response.json();
      })
      .then(data => {
        // Clear local storage
        localStorage.removeItem('wizardFormData');

        // Show success message
        this.successMessage.style.display = 'flex';

        // Reset form
        setTimeout(() => {
          this.form.reset();
          this.currentStep = 1;
          this.formData = {
            name: '',
            email: '',
            plan: ''
          };
          this.updateUI();
          this.nextBtn.disabled = false;
          this.submitBtn.disabled = false;
        }, 3000);
      })
      .catch(error => {
        alert('Error: ' + error.message);
        this.nextBtn.disabled = false;
        this.submitBtn.disabled = false;
      });
  }
}

// Initialize wizard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new FormWizard();
});
