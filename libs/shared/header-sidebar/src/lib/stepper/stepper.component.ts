import { Component, Input } from '@angular/core';

const stepper_states = ['initial', 'error', 'success'] as const;
export type Stepperstate = typeof stepper_states[number];

export interface Step {
  id: number;
  title: string;
  state: Stepperstate;
}

@Component({
  selector: 'fan-id-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
})
export class StepperComponent {
  @Input() steps: Step[];
  @Input() translateKey?: string;

  updateState({ id, state }: { id: number; state: Stepperstate }) {
    const steps = this.steps.map((step) => {
      const _step = { ...step };
      if (id === step.id) {
        _step.state = state;
      }
      return _step;
    });

    this.steps = [...steps]
  }

  getState(id: number): Stepperstate {
    if (!this.steps || this.steps.length === 0) return 'initial';
    const _step = this.steps.find((step) => id === step.id);
    return _step?.state || 'initial';
  }
}
