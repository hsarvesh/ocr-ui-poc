import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CreditsService, CreditTransaction } from '../credits.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-view-transactions',
  template: `
    <div class="container">
      <h2>Transaction History</h2>
      @if (transactions$ | async; as transactions) {
        @if (transactions.length === 0) {
          <p>No transactions found.</p>
        } @else {
          <ul class="transaction-list">
            @for (transaction of transactions; track transaction.timestamp) {
              <li class="transaction-item" [class.add]="transaction.type === 'add'" [class.spend]="transaction.type === 'spend'">
                <span class="type">{{ transaction.type | titlecase }}</span>
                <span class="description">{{ transaction.description }}</span>
                <span class="amount" [class.positive]="transaction.type === 'add'" [class.negative]="transaction.type === 'spend'">
                  {{ transaction.type === 'add' ? '+ ' : '- ' }}{{ transaction.amount }}
                </span>
                <span class="timestamp">{{ transaction.timestamp.toDate() | date:'short' }}</span>
              </li>
            }
          </ul>
        }
      } @else {
        <p>Loading transactions...</p>
      }
    </div>
  `,
  styles: [`
    .container {
      padding: 2rem;
      max-width: 800px;
      margin: auto;
    }
    h2 {
      text-align: center;
      margin-bottom: 2rem;
      color: #333;
    }
    .transaction-list {
      list-style: none;
      padding: 0;
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
    }
    .transaction-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #eee;
      background-color: #fff;
    }
    .transaction-item:last-child {
      border-bottom: none;
    }
    .type {
      font-weight: bold;
      text-transform: capitalize;
      flex: 0 0 100px;
    }
    .description {
      flex-grow: 1;
      margin: 0 1rem;
      color: #555;
    }
    .amount {
      font-weight: bold;
      flex: 0 0 80px;
      text-align: right;
    }
    .positive {
      color: green;
    }
    .negative {
      color: red;
    }
    .timestamp {
      flex: 0 0 150px;
      text-align: right;
      font-size: 0.85rem;
      color: #777;
    }
    @media (max-width: 600px) {
      .transaction-item {
        flex-wrap: wrap;
        justify-content: flex-start;
      }
      .type, .amount, .timestamp {
        flex: none;
        width: auto;
      }
      .description {
        width: 100%;
        order: 3;
        margin: 0.5rem 0;
      }
      .timestamp {
        order: 2;
        margin-left: auto;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, DatePipe],
})
export class ViewTransactionsComponent {
  private readonly creditsService = inject(CreditsService);
  readonly transactions$: Observable<CreditTransaction[]>;

  constructor() {
    this.transactions$ = this.creditsService.getTransactions();
  }
}
