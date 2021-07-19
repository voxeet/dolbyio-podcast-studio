import Foundation
import SwiftUI
import VoxeetSDK

struct PodcastView: View {
    
    @Environment(\.presentationMode) var presentationMode: Binding<PresentationMode>
    
    @ObservedObject var viewModel: PodcastViewModel
    
    private let podcastInfo: PodcastInfo

    init(podcastInfo: PodcastInfo) {
        self.podcastInfo = podcastInfo
        self.viewModel = PodcastViewModel(podcastIdentifier: podcastInfo.identifier)
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                Image("Background")
                    .resizable()
                    .scaledToFill()
                    .aspectRatio(contentMode: .fill)
                    .ignoresSafeArea()
                    .frame(width: geometry.size.width, height: geometry.size.height)
                
                VStack {
                    HStack() {
                        Text("Podcast Studio")
                            .font(.title3)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        Text("by dolby.io")
                            .font(.title3)
                            .foregroundColor(.white)
                        
                        Spacer()
                        
                        Button(action: {
                            leavePodcast { error in
                                self.presentationMode.wrappedValue.dismiss()
                            }
                        }) {
                            Image(systemName: "power")
                                .padding(.horizontal, 10.0)
                                .foregroundColor(Color.white)
                        }
                    }
                    .padding(.top, 10.0)
                    .padding(.horizontal)
                    
                    switch viewModel.state {
                    case .idle:
                        Color.clear.onAppear(perform: viewModel.load)
                    case .loading:
                        ScrollView {
                            ProgressView("Joining the podcast...")
                                .progressViewStyle(CircularProgressViewStyle(tint: Color.white))
                                .foregroundColor(.white)
                                .padding(.top, 200.0)
                        }
                        .padding(10.0)
                    case .failed(let error):
                        ScrollView {
                            Text("Error: \(error?.localizedDescription ?? "")")
                        }
                        .padding(10.0)
                    case .loaded:
                        ScrollView {
                            VStack {
                                HStack {
                                    Text(podcastInfo.name)
                                        .font(.headline)
                                        .foregroundColor(.white)
                                        .padding(.bottom, 4.0)
                                    
                                    Spacer()
                                }
                                
                                HStack {
                                    Text(podcastInfo.description)
                                        .font(.subheadline)
                                        .foregroundColor(Color.white)
                                        .padding(.bottom, 4.0)
                                        
                                    
                                    Spacer()
                                }
                                
                                ForEach(0 ..< viewModel.participants.count) { index in
                                    GeometryReader { geoVideo in
                                        VTVideoViewViewController()
                                            .setViewModel(participantVM: viewModel.participants.map {$0.value}[index], geoProxy: geoVideo)
                                            .background(Color.black)
                                            .cornerRadius(15.0)
                                    }
                                    .frame(minWidth: 100, idealWidth: 300, maxWidth: .infinity, minHeight: /*@START_MENU_TOKEN@*/0/*@END_MENU_TOKEN@*/, idealHeight: 200, maxHeight: 200, alignment: .center)
                                }
                            }
                        }
                        .padding(10.0)
                        
                        HStack {
                            Button(action: {
                                leavePodcast { error in
                                    self.presentationMode.wrappedValue.dismiss()
                                }
                            }) {
                                Text("Leave")
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 40)
                                    .padding(.vertical, 10)
                            }
                            .background(Color.red)
                            .cornerRadius(15)
                        }
                    }
                }
            }
        }
        .navigationBarHidden(true)
    }
}

struct PodcastView_Previews: PreviewProvider {
    static var previews: some View {
        PodcastView(podcastInfo: PodcastInfo.data[0])
    }
}
