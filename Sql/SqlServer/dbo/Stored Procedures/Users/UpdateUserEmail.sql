CREATE PROCEDURE [dbo].[UpdateUserEmail]
	@userId int = 0,
	@email nvarchar(75)
AS
	UPDATE Users SET email=@email WHERE userId=@userId
