# PicUpload

PicUpload is a web application that allows users to securely upload, manage, and view images. It provides a safe and convenient platform for storing and sharing images.

## Features

- **User Authentication**: Secure registration and login functionalities powered by Passport.js.
- **Image Management**: Effortlessly upload, view, and delete images directly from your profile.
- **Cloudinary Integration**: Seamlessly integrated with Cloudinary for efficient image storage and manipulation.
- **Responsive Design**: Enjoy a smooth user experience across all devices with our responsive design.
- **Error Handling**: Robust error handling mechanisms ensure a seamless experience for users.
- **Flash Messages**: Instant feedback with success and error messages displayed using flash messages.

## Getting Started

1. **Clone the Repository**: Start by cloning the repository to your local machine.

```bash
git clone https://github.com/Caged1964/picload.git
```

2. **Navigate to the project directory**: Move to the picload directory

```bash
cd picload
```

3. **Install Dependencies**: Install the required dependencies using npm.

```bash
npm install
```

4. **Set Up Environment Variables**: Create a .env file in the root directory and add the following environment variables

```
DB_URL=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret
SECRET=your_session_secret

( Replace placeholders like your_mongodb_connection_string, your_cloudinary_cloud_name, your_cloudinary_api_key, your_cloudinary_api_secret and your_session_secret with appropriate values.)
```

5. **Start the Server**: Launch the server to start using the application

```bash
npm start
```

6. **Access the Application**: Open your web browser and navigate to http://localhost:3000 to start using PicUpload!

## Usage

- Register an account or log in if you already have one.
- Upload images from your profile page.
- View uploaded images and manage them (delete) as needed.

## Screenshots

1. Homepage
   ![Home Page](Screenshots\Homepage.png)
2. Registration Page
   ![Registeration Page](Screenshots\Registeration_Page.png)
3. Login Page
   ![Login Page](Screenshots\Login_Page.png)
4. User Profile
   ![User Profile](Screenshots\User_profile.png)
   ![User Profile](Screenshots\user_profile_2.png)
5. Uplaoding Images
   ![Upload](Screenshots\upload_images.png)
6. Deleting Images
   ![Delete](Screenshots\delete_images.png)
