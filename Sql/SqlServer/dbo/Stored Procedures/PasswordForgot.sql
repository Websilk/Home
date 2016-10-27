-- =============================================
-- Author:		Mark Entingh
-- Create date: 2/12/2014 2:40 PM
-- Description:	user made a request to reset their password
-- =============================================
CREATE PROCEDURE [dbo].[PasswordForgot] 
	@email nvarchar(50) = '', 
	@resetId nvarchar(10) = ''
AS
BEGIN
	SET NOCOUNT ON;
	IF (SELECT COUNT(*) FROM PasswordReset WHERE email=@email) > 0 BEGIN
		UPDATE PasswordReset SET resetId=@resetId, datecreated=GETDATE() WHERE email=@email
	END ELSE BEGIN
		INSERT INTO PasswordReset (resetId, email, datecreated) VALUES (@resetId, @email, GETDATE())
	END
END
