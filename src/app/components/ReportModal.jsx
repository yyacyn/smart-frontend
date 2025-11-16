import { useState } from 'react';

const ReportModal = ({ isOpen, onClose, onSubmit, targetType, targetId, targetName }) => {
    const [reportType, setReportType] = useState('');
    const [description, setDescription] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(files);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!reportType || !description.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);

        try {
            // Create FormData for submission if there are attachments
            const reportData = {
                type: reportType,
                description,
                targetType,
                targetId
            };

            await onSubmit(reportData);
            // Reset form
            setReportType('');
            setDescription('');
            setAttachments([]);
            onClose();
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Laporkan {targetType === 'product' ? 'Produk' : 'Toko'}</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            &times;
                        </button>
                    </div>

                    <form onSubmit={handleFormSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Jenis Laporan *
                            </label>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="select select-bordered w-full bg-white focus:outline-none border-gray-200"
                                required
                            >
                                <option value="">Pilih jenis laporan</option>
                                <option value="fraud">Penipuan</option>
                                <option value="inappropriate">Konten Tidak Pantas</option>
                                <option value="spam">Spam</option>
                                <option value="copyright">Pelanggaran Hak Cipta</option>
                                <option value="other">Lainnya</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Deskripsi *
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="textarea textarea-bordered w-full focus:outline-none border-gray-200 bg-white"
                                rows="4"
                                placeholder="Jelaskan secara rinci mengapa Anda melaporkan ini..."
                                required
                            ></textarea>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lampiran
                            </label>
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="file-input file-input-bordered w-full bg-white border-gray-200"
                                accept="image/*,.pdf,.doc,.docx"
                            />
                            {attachments.length > 0 && (
                                <div className="mt-2 text-sm text-gray-600">
                                    {attachments.length} file{attachments.length > 1 ? 's' : ''} dipilih
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-outline border-gray-300 text-gray-700 hover:bg-gray-50 shadown-none hover:shadow-none"
                                disabled={isSubmitting}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="btn bg-[#ED775A] border-none shadow-none hover:bg-[#eb6b4b] text-white"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-xs mr-2"></span>
                                        Mengirim...
                                    </>
                                ) : 'Kirim Laporan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;