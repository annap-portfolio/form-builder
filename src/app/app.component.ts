import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { CodeGeneratorService } from '@core/services/code-generator.service';
import { FormDefinition } from '@models/form-definition.model';
import { InputType } from '@models/input-type.model';
import { DividerModule } from 'primeng/divider';
import { TabsModule } from 'primeng/tabs';
import { Subject } from 'rxjs';
import { FormBuilderComponent } from './form-builder/form-builder.component';
import { GeneratedCodeComponent } from './generated-code/generated-code.component';
import { HeaderComponent } from './header/header.component';
import { InputSelectorComponent } from './input-selector/input-selector.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    FormBuilderComponent,
    HeaderComponent,
    DividerModule,
    GeneratedCodeComponent,
    TabsModule,
    InputSelectorComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly codeGeneratorService = inject(CodeGeneratorService);

  title = 'Form Builder';

  typescriptCode = signal<string>('');
  htmlCode = signal<string>('');

  fieldTypeSelected = new Subject<InputType>();

  screenWidth = signal(window.innerWidth);
  isMobile = computed(() => this.screenWidth() < 992);
  isSidebarOpen = signal(this.screenWidth() >= 992);

  constructor() {
    window.addEventListener('resize', () => {
      this.screenWidth.set(window.innerWidth);
      this.isSidebarOpen.set(this.screenWidth() >= 992);
    });
  }

  onInputSelected(type: InputType) {
    this.fieldTypeSelected.next(type);
  }

  onFormChange(form: FormDefinition) {
    this.typescriptCode.set(this.codeGeneratorService.generateTypescriptCode(form));
    this.htmlCode.set(this.codeGeneratorService.generateHTMLTemplate(form));
  }

  toggleSidebar(open: boolean) {
    if (this.isMobile()) {
      this.isSidebarOpen.set(open);
    }
  }
}
