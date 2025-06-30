class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs) {
    const input = inputs[0];
    if (input && input[0]) {
      const channelData = input[0]; // Mono audio

      // Send data to main thread
      this.port.postMessage(new Float32Array(channelData));
    }
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
