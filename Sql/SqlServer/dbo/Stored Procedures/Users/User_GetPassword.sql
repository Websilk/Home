CREATE PROCEDURE [dbo].[User_GetPassword]
	@email nvarchar(75) = ''
AS
	SELECT [password] FROM Users WHERE email=@email
