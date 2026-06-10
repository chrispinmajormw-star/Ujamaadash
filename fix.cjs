const fs = require('fs');
const p = 'c:/Users/lenovo/Ujamaadash/Ujamaadash/src/App.tsx';
let c = fs.readFileSync(p, 'utf8');
const m = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { api, reportsApi, usersApi, documentReportsApi, districtsApi, notificationsApi, impactStoriesApi, gbvCasesApi, sessionRecordsApi } from './api';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  FilePlus,
`;
fs.writeFileSync(p, m + c, 'utf8');
