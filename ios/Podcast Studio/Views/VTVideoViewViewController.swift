import SwiftUI
import VoxeetSDK

final class VTVideoViewViewController: UIViewControllerRepresentable {

    private var participantVM: ParticipantVideoModel?
    private var geoProxy: GeometryProxy?
    
    public dynamic func setViewModel(participantVM: ParticipantVideoModel, geoProxy: GeometryProxy) -> VTVideoViewViewController {
        self.participantVM = participantVM
        self.geoProxy = geoProxy
        
        return self
    }
    
    func makeUIViewController(context: Context) -> UIViewController {
        UIViewController()
    }
    
    public func updateUIViewController(_ viewController: UIViewController, context: Context) {
        let width = self.geoProxy?.size.width ?? 10
        let height = self.geoProxy?.size.height ?? 10
        let videoView = VTVideoView(frame: CGRect(x: 0.0, y: 0.0, width: width, height: height))
        videoView.contentMode = UIView.ContentMode.scaleAspectFill
        videoView.backgroundColor = .blue
        
        
        if let participantVM = self.participantVM, let stream = participantVM.stream {
            videoView.attach(participant: participantVM.participant, stream: stream)
        }
        
        let view = UIView()
        view.addSubview(videoView)
        
        view.backgroundColor = .green
        
        viewController.view.addSubview(view)
    }
}
