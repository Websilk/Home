CREATE PROCEDURE [dbo].[GetUserPassword]
	@email nvarchar(75) = ''
AS
	SELECT [password] FROM Users WHERE email=@email
