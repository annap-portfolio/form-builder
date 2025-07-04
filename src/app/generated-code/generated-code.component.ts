import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-generated-code',
  imports: [],
  templateUrl: './generated-code.component.html',
  styleUrl: './generated-code.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneratedCodeComponent {
  typescriptCode = input.required<string>();
  htmlCode = input.required<string>();
}
