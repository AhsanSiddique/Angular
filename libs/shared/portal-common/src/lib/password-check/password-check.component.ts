import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

interface PasswordCheck {
  check_1: boolean
  check_2: boolean
  check_3: boolean
  check_4: boolean
  check_5: boolean
  check_6: boolean
}

interface PasswordTest {
  text: string
  check: boolean | undefined
}
@Component({
  selector: 'fan-id-password-check',
  templateUrl: './password-check.component.html',
  styleUrls: ['./password-check.component.scss']
})
export class PasswordCheckComponent implements OnInit, OnChanges  {
  @Input() tests?: PasswordCheck;
  @Input() desktop? = true;

  password_tests: PasswordTest[] = []

  ngOnInit() {
    this.updatePasswordtests()
  }

  ngOnChanges() {
    this.updatePasswordtests()
  }

  updatePasswordtests() {
    this.password_tests = [
      {
        text: 'PasswordCheck.test_1',
        check: this.tests?.check_1
      },
      {
        text: 'PasswordCheck.test_2',
        check: this.tests?.check_2
      },
      {
        text: 'PasswordCheck.test_3',
        check: this.tests?.check_3
      },
      {
        text: 'PasswordCheck.test_4',
        check: this.tests?.check_4
      },
      {
        text: 'PasswordCheck.test_5',
        check: this.tests?.check_5
      },
      {
        text: 'PasswordCheck.test_6',
        check: this.tests?.check_6
      }
    ]
  }
}
