// Correção para o erro do @google-cloud/storage
declare module '@google-cloud/storage' {
  namespace Storage {
    interface Int32ArrayConstructor {
      new <T>(buffer: ArrayBufferLike): Int32Array;
    }
  }
}
