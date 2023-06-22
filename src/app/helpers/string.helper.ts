export class StringHelper {
  public static generateRandomPhilippeRoomName(): string {
    return `philippe-room-${Math.floor(Math.random() * 100000)}`;
  }
}
