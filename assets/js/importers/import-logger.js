// assets/js/importers/import-logger.js
// PHASE 4: Centralized import logging helper

(function () {

    const ImportLogger = {
        /**
         * Create an import log entry
         * @param {string} importerType - 'gbol', 'passline', 'extracciones', 'afip'
         * @param {string} fileName
         * @param {number} fileSize
         * @param {string} workDayId
         * @returns {Promise<string|null>} Log ID or null if failed
         */
        async start(importerType, fileName, fileSize, workDayId) {
            try {
                const { data, error } = await window.sb
                    .from('import_logs')
                    .insert({
                        work_day_id: workDayId,
                        importer_type: importerType,
                        file_name: fileName,
                        file_size_bytes: fileSize,
                        imported_by: window.currentUser?.id || null,
                        status: 'pending'
                    })
                    .select('id')
                    .single();

                if (error) {
                    console.warn('[ImportLogger] Failed to create log:', error);
                    return null;
                }

                return data?.id;
            } catch (ex) {
                console.warn('[ImportLogger] Exception:', ex);
                return null;
            }
        },

        /**
         * Update import log on completion
         * @param {string} logId
         * @param {Object} result
         * @param {number} result.duration_ms
         * @param {number} result.rows_processed
         * @param {number} result.rows_imported
         * @param {number} [result.rows_skipped]
         * @param {number} [result.rows_failed]
         * @param {Object} [result.warnings]
         * @param {string} [result.error_message]
         * @param {Object} [result.error_details]
         */
        async complete(logId, result) {
            if (!logId) return;

            try {
                const status = result.error_message ? 'failed' :
                    result.rows_failed > 0 ? 'partial' : 'success';

                await window.sb
                    .from('import_logs')
                    .update({
                        status: status,
                        completed_at: new Date().toISOString(),
                        duration_ms: result.duration_ms,
                        rows_processed: result.rows_processed || 0,
                        rows_imported: result.rows_imported || 0,
                        rows_skipped: result.rows_skipped || 0,
                        rows_failed: result.rows_failed || 0,
                        error_message: result.error_message || null,
                        error_details: result.error_details || null,
                        warnings: result.warnings || null
                    })
                    .eq('id', logId);
            } catch (ex) {
                console.warn('[ImportLogger] Failed to update log:', ex);
            }
        },

        /**
         * Convenience wrapper for timed imports
         * @param {string} importerType
         * @param {File} file
         * @param {string} workDayId
         * @param {Function} importFn - Async function that performs the import
         * @returns {Promise<Object>} Import result
         */
        async wrap(importerType, file, workDayId, importFn) {
            const logId = await this.start(importerType, file.name, file.size, workDayId);
            const startTime = Date.now();

            try {
                const result = await importFn();

                await this.complete(logId, {
                    duration_ms: Date.now() - startTime,
                    rows_processed: result.count || result.rows_processed || 0,
                    rows_imported: result.count || result.rows_imported || 0,
                    rows_skipped: result.skipped || 0,
                    rows_failed: result.failed || 0,
                    warnings: result.warnings || null
                });

                return result;

            } catch (error) {
                await this.complete(logId, {
                    duration_ms: Date.now() - startTime,
                    rows_processed: 0,
                    rows_imported: 0,
                    error_message: error.message,
                    error_details: { stack: error.stack }
                });

                throw error;
            }
        }
    };

    window.ImportLogger = ImportLogger;

})();
