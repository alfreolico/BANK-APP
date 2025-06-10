export class CreateTransactionDto {
  private constructor(
    public readonly receiver_account_number: string,
    public readonly amount: number
  ) {}

  static create(object: {
    [key: string]: any;
  }): [string?, CreateTransactionDto?] {
    const { receiver_account_number, amount } = object;

    if (!receiver_account_number) return ['Missing receiver account number'];
    if (!amount) return ['Missing amount'];
    if (amount < 1) return ['Amount must be at least $1'];
    if (amount > 2000) return ['Amount cannot exceed $2000'];

    return [
      undefined,
      new CreateTransactionDto(receiver_account_number, Number(amount)),
    ];
  }
}
