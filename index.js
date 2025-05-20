// const fs = require('fs');
// const path = require('path');
// const { exec } = require('child_process');
// const util = require('util');

// const execPromise = util.promisify(exec);

// const videoUrl = 'https://www.youtube.com/watch?v=UTTFvKUnITw';
// const outputDir = process.cwd();
// const language = 'vi'; // ví dụ: 'en', 'vi', 'ja'

// async function runCommand(command) {
//   try {
//     const { stdout, stderr } = await execPromise(command);
//     return { stdout, stderr };
//   } catch (error) {
//     throw { error, stdout: error.stdout, stderr: error.stderr };
//   }
// }

// async function downloadOrGenerateSubtitles() {
//   try {
//     console.log(`🟡 Kiểm tra và tải phụ đề ngôn ngữ "${language}" từ video...`);

//     // Lệnh tải phụ đề nếu có
//     const ytDlpCommand = `yt-dlp --write-sub --sub-lang ${language} --convert-subs srt --skip-download -o "${path.join(outputDir, '%(title)s.%(ext)s')}" "${videoUrl}"`;
//     const { stdout, stderr } = await runCommand(ytDlpCommand);

//     console.log(stdout);
//     if (stderr) console.warn(`⚠️ ${stderr}`);

//     // Tìm file phụ đề vừa tạo
//     const srtFiles = fs.readdirSync(outputDir).filter(file => file.endsWith(`${language}.srt`));
//     if (srtFiles.length > 0) {
//       console.log(`✅ Đã tải phụ đề: ${srtFiles.map(f => path.join(outputDir, f)).join(', ')}`);
//       return;
//     }

//     // Nếu không tìm thấy phụ đề -> tải audio
//     console.log(`🔵 Không có phụ đề "${language}". Đang tải audio...`);
//     const audioFile = path.join(outputDir, 'temp_audio.mp3');
//     const audioCommand = `yt-dlp -x --audio-format mp3 -o "${audioFile}" "${videoUrl}"`;
//     await runCommand(audioCommand);
//     console.log(`✅ Đã tải audio vào: ${audioFile}`);

//     // Dùng Whisper tạo phụ đề tự động
//     console.log(`🔵 Đang tạo phụ đề tự động với Whisper (ngôn ngữ: ${language})...`);
//     const whisperCommand = `whisper "${audioFile}" --model small --language ${language} --output_format srt --output_dir "${outputDir}"`;
//     const { stdout: whisperOut } = await runCommand(whisperCommand);
//     console.log(whisperOut);

//     const whisperSrt = path.join(outputDir, 'temp_audio.srt');
//     if (fs.existsSync(whisperSrt)) {
//       console.log(`✅ Whisper đã tạo phụ đề: ${whisperSrt}`);
//       fs.unlinkSync(audioFile); // xóa audio tạm
//       console.log('🗑️ Đã xóa file âm thanh tạm thời.');
//     } else {
//       throw new Error('Không thể tạo phụ đề tự động bằng Whisper.');
//     }

//   } catch (err) {
//     console.error(`❌ Lỗi: ${err.message || err}`);
//     if (err.stderr) console.error(`🪵 Chi tiết:\n${err.stderr}`);
//     console.error('🧩 Gợi ý:');
//     console.error(`  - Kiểm tra video có phụ đề thật không`);
//     console.error(`  - Đảm bảo đã cài Python, ffmpeg, whisper`);
//   }
// }

// downloadOrGenerateSubtitles();


const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

const videoUrl = 'https://www.youtube.com/watch?v=UTTFvKUnITw';
const outputDir = process.cwd();
const language = 'vi'; // ví dụ: 'en', 'vi', 'ja'

async function runCommand(command) {
  try {
    const { stdout, stderr } = await execPromise(command);
    return { stdout, stderr };
  } catch (error) {
    throw { error, stdout: error.stdout, stderr: error.stderr };
  }
}

async function downloadOrGenerateSubtitles() {
  try {
    console.log(`🟡 Kiểm tra và tải phụ đề ngôn ngữ "${language}" từ video...`);

    // Lệnh tải phụ đề nếu có
    const ytDlpCommand = `yt-dlp --write-sub --sub-lang ${language} --convert-subs srt --skip-download -o "${path.join(outputDir, '%(title)s.%(ext)s')}" "${videoUrl}"`;
    const { stdout, stderr } = await runCommand(ytDlpCommand);

    console.log(stdout);
    if (stderr) console.warn(`⚠️ ${stderr}`);

    // Tìm file phụ đề vừa tạo
    const srtFiles = fs.readdirSync(outputDir).filter(file => file.endsWith(`${language}.srt`));
    if (srtFiles.length > 0) {
      console.log(`✅ Đã tải phụ đề: ${srtFiles.map(f => path.join(outputDir, f)).join(', ')}`);
      return;
    }

    // Nếu không tìm thấy phụ đề -> tải audio
    console.log(`🔵 Không có phụ đề "${language}". Đang tải audio...`);
    const audioFile = path.join(outputDir, 'temp_audio.mp3');
    const audioCommand = `yt-dlp -x --audio-format mp3 -o "${audioFile}" "${videoUrl}"`;
    await runCommand(audioCommand);
    console.log(`✅ Đã tải audio vào: ${audioFile}`);

    // Dùng faster-whisper tạo phụ đề tự động (thay vì whisper)
    console.log(`🔵 Đang tạo phụ đề tự động với faster-whisper (ngôn ngữ: ${language})...`);
    const whisperCommand = `python3 whisper.py "${audioFile}" ${language} "${outputDir}"`;
    const { stdout: whisperOut, stderr: whisperErr } = await runCommand(whisperCommand);
    console.log(fwOut);
    if (fwErr) console.warn(`⚠️ ${fwErr}`);

    const whisperSrt = path.join(outputDir, 'temp_audio.srt');
    if (fs.existsSync(whisperSrt)) {
      console.log(`✅ faster-whisper đã tạo phụ đề: ${whisperSrt}`);
      fs.unlinkSync(audioFile); // xóa audio tạm
      console.log('🗑️ Đã xóa file âm thanh tạm thời.');
    } else {
      throw new Error('Không thể tạo phụ đề tự động bằng faster-whisper.');
    }

  } catch (err) {
    console.error(`❌ Lỗi: ${err.message || err}`);
    if (err.stderr) console.error(`🪵 Chi tiết:\n${err.stderr}`);
    console.error('🧩 Gợi ý:');
    console.error(`  - Kiểm tra video có phụ đề thật không`);
    console.error(`  - Đảm bảo đã cài Python, ffmpeg, faster-whisper`);
  }
}

downloadOrGenerateSubtitles();
