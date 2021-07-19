import SwiftUI
import VoxeetSDK

struct SettingsView: View {
    
    @Environment(\.presentationMode) var presentationMode: Binding<PresentationMode>
    
    private let rand: Int = Int.random(in: 0...10000)
    
    @State private var externalID: String = ""
    @State private var name: String = ""
    @State private var isConnected: Bool = false
    
    private func setValues() {
        if let externalID = VoxeetSDK.shared.session.participant?.info.externalID,
           let name = VoxeetSDK.shared.session.participant?.info.name {
            self.externalID = externalID
            self.name = name
            self.isConnected = true
        } else {
            self.externalID = "listener-\(self.rand)"
            self.name = "Listener #\(self.rand)"
            self.isConnected = false
        }
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
                        Button(action: {
                            self.presentationMode.wrappedValue.dismiss()
                        }) {
                            Image(systemName: "chevron.left")
                                .foregroundColor(Color.white)
                        }
                        Text("Podcast Studio")
                            .font(.title3)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        Text("by dolby.io")
                            .font(.title3)
                            .foregroundColor(.white)
                        
                        Spacer()
                    }
                    .padding(.top, 10.0)
                    .padding(.horizontal)
                    
                    VStack {
                        Text("Settings")
                            .font(.title)
                            .foregroundColor(.white)
                        
                        HStack {
                            Text("Your name:")
                                .foregroundColor(.white)
                            
                            Spacer()
                            
                            TextField("Your name", text: $name)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .disabled(self.isConnected)
                        }
                        .padding(10.0)
                        
                        HStack {
                            Text("External ID:")
                                .foregroundColor(.white)
                            
                            Spacer()
                            
                            TextField("External ID", text: $externalID)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .disabled(self.isConnected)
                        }
                        .padding(10.0)
                        
                        if (!self.isConnected) {
                            
                            Button(action: {
                                openSession(externalID: self.externalID, name: self.name, avatarURL: nil, success: { () in
                                    self.presentationMode.wrappedValue.dismiss()
                                }, fail: { error in
                                    Alert(
                                        title: Text("Error"),
                                        message: Text(error?.localizedDescription ?? ""),
                                        dismissButton: .default(Text("Ok"))
                                    )
                                })
                            }) {
                                Text("Connect")
                                    .padding(.horizontal, 30.0)
                                    .padding(.vertical, 10.0)
                                    
                            }
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(10.0)
                            
                        }
                    }
                    .padding(.top, 20.0)
                    
                    Spacer()
                }
            }
        }
        .navigationBarHidden(true)
        .onAppear {
            self.setValues()
        }
        
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
    }
}
