import { createApp } from 'vue';
import ExampleApp from './ExampleApp';
import { HospitalMedicalRecordsPlugin } from '../src/index';

const app = createApp(ExampleApp);

// Test de consommation du plugin
app.use(HospitalMedicalRecordsPlugin);

app.mount('#app');