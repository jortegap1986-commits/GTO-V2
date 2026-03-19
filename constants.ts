export const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
export const END_OF_SHIFT_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours
export const THEORETICAL_WORK_HOURS = 8.2; // Theoretical useful hours in a workday

export const OUTBOUND_PROCESSES = ['Picking RCK', 'Picking MZN', 'Picking CP', 'Picking de Altura', 'Packing', 'Consolidación', 'Despacho'];
export const INBOUND_PROCESSES = ['Recepción', 'Almacenamiento RCK', 'Almacenamiento Losas y Run'];

export const PRODUCTIVITY_PROCESSES = [
    'Picking RCK', 
    'Picking MZN',
    'Picking CP',
    'Picking de Altura',
    'Packing', 
    'Consolidación', 
    'Despacho', 
    'Almacenamiento RCK',
    'Almacenamiento Losas y Run'
];

export const TEAMS = {
    INBOUND: INBOUND_PROCESSES,
    OUTBOUND: OUTBOUND_PROCESSES
};

export const RAW_OCR_DATA = `
OPCION;FECHA_CREACION;FECHA_MODIFICACION;USUARIO;PROCESO;NOMBRE;AREA
INICIO;16/07/2025 23:23:48;16/07/2025 23:23:48;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:36:47;16/07/2025 23:36:47;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:36:49;16/07/2025 23:36:49;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:31:56;16/07/2025 23:31:56;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:41:44;16/07/2025 23:41:44;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:31:46;16/07/2025 23:31:46;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:31:49;16/07/2025 23:31:49;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:31:51;16/07/2025 23:31:51;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:41:49;16/07/2025 23:41:49;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:32:31;16/07/2025 23:32:31;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 22:44:49;16/07/2025 22:44:49;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 22:44:01;16/07/2025 22:44:01;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:23:28;16/07/2025 23:23:28;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:33:18;16/07/2025 23:33:18;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:34:39;16/07/2025 23:34:39;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:40:19;16/07/2025 23:40:19;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:32:02;16/07/2025 23:32:02;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 22:27:30;16/07/2025 22:27:30;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 22:43:44;16/07/2025 22:43:44;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:31:48;16/07/2025 23:31:48;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 22:47:54;16/07/2025 22:47:54;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 22:45:21;16/07/2025 22:45:21;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 22:22:40;16/07/2025 22:22:40;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 22:23:28;16/07/2025 22:23:28;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 22:23:41;16/07/2025 22:23:41;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:40:09;16/07/2025 23:40:09;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 22:27:43;16/07/2025 22:27:43;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 22:27:10;16/07/2025 22:27:10;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:31:53;16/07/2025 23:31:53;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:34:37;16/07/2025 23:34:37;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:36:48;16/07/2025 23:36:48;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 22:43:50;16/07/2025 22:43:50;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:40:34;16/07/2025 23:40:34;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:31:52;16/07/2025 23:31:52;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:35:27;16/07/2025 23:35:27;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:31:47;16/07/2025 23:31:47;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 22:43:30;16/07/2025 22:43:30;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:24:46;16/07/2025 23:24:46;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 22:22:51;16/07/2025 22:22:51;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 22:44:42;16/07/2025 22:44:42;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 22:27:38;16/07/2025 22:27:38;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 22:27:23;16/07/2025 22:27:23;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:25:09;16/07/2025 23:25:09;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:40:39;16/07/2025 23:40:39;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:31:59;16/07/2025 23:31:59;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:32:10;16/07/2025 23:32:10;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:34:38;16/07/2025 23:34:38;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:36:45;16/07/2025 23:36:45;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:36:51;16/07/2025 23:36:51;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:31:45;16/07/2025 23:31:45;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:31:47;16/07/2025 23:31:47;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:41:40;16/07/2025 23:41:40;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:40:20;16/07/2025 23:40:20;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:24:20;16/07/2025 23:24:20;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:24:05;16/07/2025 23:24:05;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 22:22:56;16/07/2025 22:22:56;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 22:45:00;16/07/2025 22:45:00;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:24:12;16/07/2025 23:24:12;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:23:33;16/07/2025 23:23:33;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 22:45:26;16/07/2025 22:45:26;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 22:44:11;16/07/2025 22:44:11;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:35:02;16/07/2025 23:35:02;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:31:42;16/07/2025 23:31:42;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:36:30;16/07/2025 23:36:30;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:31:44;16/07/2025 23:31:44;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:31:50;16/07/2025 23:31:50;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:31:51;16/07/2025 23:31:51;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:31:43;16/07/2025 23:31:43;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 22:43:23;16/07/2025 22:43:23;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 22:22:45;16/07/2025 22:22:45;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 22:45:54;16/07/2025 22:45:54;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:22:57;16/07/2025 23:22:57;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:25:01;16/07/2025 23:25:01;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:33:04;16/07/2025 23:33:04;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:31:58;16/07/2025 23:31:58;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:36:44;16/07/2025 23:36:44;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 23:33:13;16/07/2025 23:33:13;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 23:41:42;16/07/2025 23:41:42;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 22:23:10;16/07/2025 22:23:10;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 22:23:20;16/07/2025 22:23:20;ANGROJ;Recepción;Angelica Rojas;Picking
INICIO;16/07/2025 22:45:06;16/07/2025 22:45:06;ANGROJ;Recepción;Angelica Rojas;Picking
FIN;16/07/2025 00:26:47;16/07/2025 00:26:47;BAZOCAR;Almacenamiento;Benjamin Zocar;Inbound
INICIO;16/07/2025 00:26:50;16/07/2025 00:26:50;BAZOCAR;Almacenamiento;Benjamin Zocar;Inbound
FIN;16/07/2025 00:14:02;16/07/2025 00:14:02;BAZOCAR;Almacenamiento;Benjamin Zocar;Inbound
INICIO;16/07/2025 22:35:11;16/07/2025 22:35:11;BSANDOVAL;Empaque;Bruno Sandoval;Packing
FIN;16/07/2025 22:38:59;16/07/2025 22:38:59;BSANDOVAL;Empaque;Bruno Sandoval;Packing
INICIO;16/07/2025 22:44:13;16/07/2025 22:44:13;BSANDOVAL;Empaque;Bruno Sandoval;Packing
FIN;16/07/2025 23:00:00;16/07/2025 23:00:00;BSANDOVAL;Empaque;Bruno Sandoval;Packing
INICIO;16/07/2025 22:58:45;16/07/2025 22:58:45;BSANDOVAL;Empaque;Bruno Sandoval;Packing
FIN;16/07/2025 22:51:58;16/07/2025 22:51:58;BSANDOVAL;Empaque;Bruno Sandoval;Packing
INICIO;16/07/2025 23:26:56;16/07/2025 23:26:56;BSANDOVAL;Empaque;Bruno Sandoval;Packing
FIN;16/07/2025 23:31:38;16/07/2025 23:31:38;BSANDOVAL;Empaque;Bruno Sandoval;Packing
INICIO;16/07/2025 23:36:51;16/07/2025 23:36:51;BSANDOVAL;Empaque;Bruno Sandoval;Packing
FIN;16/07/2025 23:38:32;16/07/2025 23:38:32;BSANDOVAL;Empaque;Bruno Sandoval;Packing
INICIO;16/07/2025 22:43:34;16/07/2025 22:43:34;BSANDOVAL;Empaque;Bruno Sandoval;Packing
FIN;16/07/2025 22:45:53;16/07/2025 22:45:53;BSANDOVAL;Empaque;Bruno Sandoval;Packing
INICIO;16/07/2025 23:11:39;16/07/2025 23:11:39;BSANDOVAL;Empaque;Bruno Sandoval;Packing
FIN;16/07/2025 22:17:38;16/07/2025 22:17:38;CCIUFFARDI;Almacenamiento;Carla Ciuffardi;Inbound
INICIO;16/07/2025 22:19:00;16/07/2025 22:19:00;CCIUFFARDI;Almacenamiento;Carla Ciuffardi;Inbound
FIN;16/07/2025 23:22:10;16/07/2025 23:22:10;CCIUFFARDI;Almacenamiento;Carla Ciuffardi;Inbound
INICIO;16/07/2025 22:58:18;16/07/2025 22:58:18;CCIUFFARDI;Almacenamiento;Carla Ciuffardi;Inbound
FIN;16/07/2025 23:14:02;16/07/2025 23:14:02;CGARCIA;Recepción;Carlos Garcia;Picking
INICIO;16/07/2025 23:47:27;16/07/2025 23:47:27;CGARCIA;Recepción;Carlos Garcia;Picking
FIN;16/07/2025 06:01:39;16/07/2025 06:01:39;CL12015723;Empaque;Usuario CL12015723;Packing
INICIO;16/07/2025 06:14:17;16/07/2025 06:14:17;CL12015723;Empaque;Usuario CL12015723;Packing
FIN;16/07/2025 01:22:28;16/07/2025 01:22:28;CL16026038;Despacho;Usuario CL16026038;Outbound
INICIO;16/07/2025 01:22:59;16/07/2025 01:22:59;CL16026038;Despacho;Usuario CL16026038;Outbound
FIN;16/07/2025 00:03:16;16/07/2025 00:03:16;CL20552958;Despacho;Usuario CL20552958;Outbound
INICIO;16/07/2025 00:03:27;16/07/2025 00:03:27;CL20552958;Despacho;Usuario CL20552958;Outbound
FIN;16/07/2025 22:51:21;16/07/2025 22:51:21;CL20905375;Recepción;Usuario CL20905375;Picking
INICIO;16/07/2025 22:55:28;16/07/2025 22:55:28;CL20905375;Recepción;Usuario CL20905375;Picking
FIN;16/07/2025 22:42:53;16/07/2025 22:42:53;CL21297278;Recepción;Usuario CL21297278;Picking
INICIO;16/07/2025 22:42:49;16/07/2025 22:42:49;CL21297278;Recepción;Usuario CL21297278;Picking
FIN;16/07/2025 23:07:15;16/07/2025 23:07:15;CL26713005;Almacenamiento;Usuario CL26713005;Inbound
INICIO;16/07/2025 23:07:29;16/07/2025 23:07:29;CL26713005;Almacenamiento;Usuario CL26713005;Inbound
FIN;16/07/2025 00:57:58;16/07/2025 00:57:58;CMANTILLA;Empaque;Claudia Mantilla;Packing
INICIO;16/07/2025 01:44:04;16/07/2025 01:44:04;CMANTILLA;Empaque;Claudia Mantilla;Packing
FIN;16/07/2025 01:11:11;16/07/2025 01:11:11;FRAVERDU;Recepción;Francisco Verdugo;Picking
INICIO;16/07/2025 00:15:16;16/07/2025 00:15:16;FRAVERDU;Recepción;Francisco Verdugo;Picking
FIN;16/07/2025 01:19:19;16/07/2025 01:19:19;GFIGUERA;Almacenamiento;Gabriel Figuera;Inbound
INICIO;16/07/2025 02:42:08;16/07/2025 02:42:08;GFIGUERA;Almacenamiento;Gabriel Figuera;Inbound
FIN;16/07/2025 06:00:26;16/07/2025 06:00:26;GJIMENEZ;Despacho;Gustavo Jimenez;Outbound
INICIO;16/07/2025 00:46:20;16/07/2025 00:46:20;GJIMENEZ;Despacho;Gustavo Jimenez;Outbound
FIN;16/07/2025 22:37:17;16/07/2025 22:37:17;IASQUEZ;Recepción;Isidora Vasquez;Picking
INICIO;16/07/2025 22:28:31;16/07/2025 22:28:31;IASQUEZ;Recepción;Isidora Vasquez;Picking
FIN;16/07/2025 00:29:26;16/07/2025 00:29:26;JVALDEZ;Empaque;Juan Valdez;Packing
INICIO;16/07/2025 00:29:36;16/07/2025 00:29:36;JVALDEZ;Empaque;Juan Valdez;Packing
FIN;16/07/2025 03:01:02;16/07/2025 03:01:02;JVIDAL;Almacenamiento;Javier Vidal;Inbound
INICIO;16/07/2025 00:23:40;16/07/2025 00:23:40;JVIDAL;Almacenamiento;Javier Vidal;Inbound
FIN;16/07/2025 00:07:05;16/07/2025 00:07:05;KPEREZ;Recepción;Karen Perez;Picking
INICIO;16/07/2025 00:10:18;16/07/2025 00:10:18;KPEREZ;Recepción;Karen Perez;Picking
FIN;16/07/2025 00:17:47;16/07/2025 00:17:47;LFIGUEROA;Empaque;Luis Figueroa;Packing
INICIO;16/07/2025 00:11:56;16/07/2025 00:11:56;LFIGUEROA;Empaque;Luis Figueroa;Packing
FIN;16/07/2025 01:20:55;16/07/2025 01:20:55;PBEZZOLO;Almacenamiento;Patricio Bezzolo;Inbound
INICIO;16/07/2025 00:43:10;16/07/2025 00:43:10;PBEZZOLO;Almacenamiento;Patricio Bezzolo;Inbound
FIN;16/07/2025 03:39:47;16/07/2025 03:39:47;RAMORALES;Despacho;Ricardo Morales;Outbound
INICIO;16/07/2025 03:41:03;16/07/2025 03:41:03;RAMORALES;Despacho;Ricardo Morales;Outbound
FIN;16/07/2025 01:48:43;16/07/2025 01:48:43;RFIGUEROA;Recepción;Raul Figueroa;Picking
INICIO;16/07/2025 01:49:14;16/07/2025 01:49:14;RFIGUEROA;Recepción;Raul Figueroa;Picking
FIN;16/07/2025 00:47:06;16/07/2025 00:47:06;SSILVA;Empaque;Sebastian Silva;Packing
INICIO;16/07/2025 00:47:15;16/07/2025 00:47:15;SSILVA;Empaque;Sebastian Silva;Packing
FIN;16/07/2025 22:28:05;16/07/2025 22:28:05;WCHACIN;Almacenamiento;Walter Chacin;Inbound
INICIO;16/07/2025 22:28:38;16/07/2025 22:28:38;WCHACIN;Almacenamiento;Walter Chacin;Inbound
FIN;16/07/2025 03:06:56;16/07/2025 03:06:56;WIABANTO;Despacho;Wilmer Iabanto;Outbound
INICIO;16/07/2025 03:26:02;16/07/2025 03:26:02;WIABANTO;Despacho;Wilmer Iabanto;Outbound
`;
