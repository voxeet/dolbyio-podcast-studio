import SwiftUI

struct PodcastCardView: View {
    let podcastInfo: PodcastInfo
    
    @State var joinThePodcast = false

    var body: some View {
        ZStack {
            VStack() {
                if podcastInfo.isLive {
                    HStack {
                        HStack {
                            Image(systemName: "circle.fill")
                                .padding(.leading, 5.0)
                                .foregroundColor(.red)
                            
                            Text("live")
                                .foregroundColor(.white)
                                .padding(.leading, -5.0)
                                .padding(.trailing, 5.0)
                                .padding(.vertical, 2.0)
                        }
                        .background(Color(red: 0.0, green: 0.0, blue: 0.0, opacity: 0.15))
                        .foregroundColor(Color.white)
                        .cornerRadius(20)
                        .padding(.bottom, 5.0)
                        
                        Spacer()
                    }
                }
                
                HStack {
                    Text(podcastInfo.name)
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding(.bottom, 4.0)
                    
                    Spacer()
                }
                
                HStack {
                    Text(podcastInfo.description)
                        .font(.caption)
                        .foregroundColor(Color(red: 150/255, green: 150/255, blue: 150/255, opacity: 1.0))
                    
                    Spacer()
                }
                
                if podcastInfo.isLive {
                
                    HStack {
                        Button(action: {
                            self.joinThePodcast = true
                        }) {
                            Text("Join the podcast")
                                .foregroundColor(.white)
                                .padding(.horizontal, 20.0)
                                .padding(.vertical, 10.0)
                        }
                        .background(Color(red: 0.0, green: 0.0, blue: 0.0, opacity: 0.3))
                        .foregroundColor(Color.white)
                        .cornerRadius(20)
                        .padding(.top, 5.0)
                        
                        Spacer()
                    }
                    
                }
            }
        }
        .padding()
        .frame(minWidth: 0, maxWidth: .infinity, minHeight: 0, maxHeight: .infinity)
        .background(
            LinearGradient(gradient: Gradient(colors: Color.gradient), startPoint: .topLeading, endPoint: .bottomTrailing)
                .edgesIgnoringSafeArea(.all)
        )
        .cornerRadius(10)
        .sheet(isPresented: self.$joinThePodcast) {
            PodcastView(podcastInfo: self.podcastInfo)
        }
    }
}

struct PodcastCardView_Previews: PreviewProvider {
    static var podcastInfo = PodcastInfo.data[0]
    static var previews: some View {
        PodcastCardView(podcastInfo: podcastInfo)
            .previewLayout(.fixed(width: 400, height: 150))
    }
}

extension Color {
  static var gradient: Array<Color> {
    return [
      Color(red: 0, green: 0, blue: 0, opacity: 0.15),
      Color(red: 0, green: 0, blue: 0, opacity: 0.25)
    ]
  }
}
