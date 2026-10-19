// Compila la APK de depuración y la deja en ./Kodama.apk
//   1. preparar-apk.mjs: IP de este PC como servidor por defecto
//   2. cap sync android: copia www/ y los plugins al proyecto Android
//   3. gradlew assembleDebug con el JDK de Android Studio (no hay Java en el PATH)
import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const correr = (cmd, opciones = {}) => execSync(cmd, { cwd: raiz, stdio: 'inherit', ...opciones });

const javaHome = process.env.JAVA_HOME || 'C:\\Program Files\\Android\\Android Studio\\jbr';
if (!existsSync(path.join(javaHome, 'bin', 'java.exe'))) {
  console.error(`No encontré Java en ${javaHome}. Instala Android Studio o define JAVA_HOME.`);
  process.exit(1);
}

// Gradle necesita saber dónde está el SDK de Android.
const propiedades = path.join(raiz, 'android', 'local.properties');
const sdk = process.env.ANDROID_HOME || path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk');
if (!existsSync(propiedades) && existsSync(sdk)) writeFileSync(propiedades, `sdk.dir=${sdk.replace(/\\/g, '/')}\n`);

correr('node scripts/preparar-apk.mjs');
correr('npx cap sync android');
// Ruta completa: con NoDefaultCurrentDirectoryInExePath, cmd no busca en la carpeta actual.
const gradlew = path.join(raiz, 'android', 'gradlew.bat');
correr(`"${gradlew}" assembleDebug`, { cwd: path.join(raiz, 'android'), shell: true, env: { ...process.env, JAVA_HOME: javaHome } });

const apk = path.join(raiz, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
copyFileSync(apk, path.join(raiz, 'Kodama.apk'));
console.log(`\nListo: Kodama.apk (${(statSync(apk).size / 1024 / 1024).toFixed(1)} MB)`);
