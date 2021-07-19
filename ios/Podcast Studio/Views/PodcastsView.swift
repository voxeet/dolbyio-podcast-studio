import SwiftUI

struct PodcastsView: View {
    
    @ObservedObject var viewModel: PodcastsViewModel
    
    init() {
        self.viewModel = PodcastsViewModel()
    }
    
    var body: some View {
        GeometryReader { geometry in
            NavigationView {
            
                ZStack {
                    Image("Background")
                        .resizable()
                        .scaledToFill()
                        .aspectRatio(contentMode: .fill)
                        .ignoresSafeArea()
                        .frame(width: geometry.size.width, height: geometry.size.height)
                    
                    VStack {
                        HStack() {
                            Image(systemName: "mic")
                                .foregroundColor(Color.white)
                            Text("Podcast Studio")
                                .font(.title3)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                            Text("by dolby.io")
                                .font(.title3)
                                .foregroundColor(.white)
                            
                            Spacer()
                            
                            NavigationLink(destination: SettingsView()) {
                                Image(systemName: "slider.horizontal.3")
                                    .padding(.horizontal, 10.0)
                                    .foregroundColor(Color.white)
                            }
                        }
                        .padding(.top, 10.0)
                        .padding(.horizontal)
                        
                        ScrollView {
                            switch viewModel.state {
                            case .idle:
                                // Render a clear color and start the loading process
                                // when the view first appears, which should make the
                                // view model transition into its loading state:
                                Color.clear.onAppear(perform: viewModel.load)
                            case .loading:
                                ScrollView {
                                    ProgressView("Loading the podcasts...")
                                        .progressViewStyle(CircularProgressViewStyle(tint: Color.white))
                                        .foregroundColor(.white)
                                        .padding(.top, 200.0)
                                }
                                .padding(10.0)
                            case .failed(_): //.failed(let error):
                                Text("error")
                            case .loaded:
                                LazyVStack {
                                    ForEach(viewModel.podcastInfos, id: \.identifier) { podcastInfo in
                                        PodcastCardView(podcastInfo: podcastInfo)
                                    }
                                }
                                .padding(10.0)
                            }
                        }
                    }
                }
                .navigationBarHidden(true)
            }
            
        }
        
    }
}

struct PodcastsView_Previews: PreviewProvider {
    static var previews: some View {
        PodcastsView()
    }
}
