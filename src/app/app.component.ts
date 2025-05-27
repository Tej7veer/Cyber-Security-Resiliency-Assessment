import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, ReactiveFormsModule ],
  templateUrl: './app.component.html',
styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Cyber';
   formSections: any[] = [];
  dynamicForm!: FormGroup;
  currentSectionIndex = 0;
  isFormLoaded = false;
  submitting = false;


  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    this.dynamicForm = this.fb.group({});
    this.http.get<any[]>('https://localhost:7047/v1/').subscribe(data => {
      this.formSections = data;
      this.buildForm();
      this.isFormLoaded = true;
    });
  }

  buildForm() {
    this.formSections.forEach(section => {
      section.fields.forEach((field: any) => {
        this.dynamicForm.addControl(
          field.name,
          this.fb.control('', field.required ? Validators.required : [])
        );
      });
    });
  }

  get currentSection() {
    return this.formSections[this.currentSectionIndex];
  }

  nextSection() {
    if (this.isSectionValid()) {
      this.currentSectionIndex++;
    }
  }

  prevSection() {
    if (this.currentSectionIndex > 0) {
      this.currentSectionIndex--;
    }
  }

  isSectionValid(): boolean {
    const section = this.currentSection;
    let valid = true;
    section.fields.forEach((field: any) => {
      const control = this.dynamicForm.get(field.name);
      control?.markAsTouched();
      if (control?.invalid) valid = false;
    });
    return valid;
  }

  onSubmit() {
    if (this.dynamicForm.valid) {
      console.log(this.dynamicForm.value);
    this.submitting = true;  

this.http.post('https://localhost:7047/v1/submit-form', this.dynamicForm.value).subscribe({
      next: (response) => {
        console.log('Form submitted successfully:', response);
        alert('Form submitted successfully!');
        this.dynamicForm.reset();  
        this.currentSectionIndex = 0;  
      },
      error: (error) => {
        console.error('Form submission error:', error);
        alert('There was an error submitting the form.');
      }
    });
      } else {
      alert("Please complete all required fields.");
    }
  }
}
