import { useState, useRef, useEffect } from 'react';

const ReportModal = ({ isOpen, onClose, onSubmit, targetType, targetId, targetName }) => {
    const modalRef = useRef(null);
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
            modalRef.current?.close();
            onClose();
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Effect to handle modal open/close based on isOpen prop
    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.showModal();
        } else if (!isOpen && modalRef.current) {
            modalRef.current.close();
        }
    }, [isOpen]);

    const handleClose = () => {
        modalRef.current?.close();
        onClose();
    };

    return (
        <dialog ref={modalRef} className="modal">
            <div className="modal-box bg-white">
                <form method="dialog">
                    <button 
                        type="button"
                        onClick={handleClose}
                        className="btn btn-sm btn-circle btn-ghost hover:bg-gray-100 border-none text-black shadow-none absolute right-2 top-2"
                    >
                        ✕
                    </button>
                </form>
                
                <h3 className="font-bold text-lg mb-4">Laporkan {targetType === 'product' ? 'Produk' : 'Toko'}</h3>

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

                    <div className="modal-action">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn btn-ghost hover:bg-gray-100 border-none text-black shadow-none"
                            disabled={isSubmitting}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="btn bg-[#ED775A] border-none hover:bg-[#eb6b4b] text-white shadow-none"
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
            
            <form method="dialog" className="modal-backdrop">
                <button type="button" onClick={handleClose}>close</button>
            </form>
        </dialog>
    );
};

export default ReportModal;