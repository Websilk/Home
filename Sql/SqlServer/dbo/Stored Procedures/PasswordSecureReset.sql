-- =============================================
-- Author:		Mark Entingh
-- Create date: 2/12/2014 2:42 PM
-- Description: reset password after authenticating resetId
-- =============================================
CREATE PROCEDURE [dbo].[PasswordSecureReset]
	@resetId nvarchar(10) = '',
	@newpass nvarchar(100) = ''
AS
BEGIN
	SET NOCOUNT ON;
	IF (SELECT DATEDIFF(hour,datecreated,GETDATE()) FROM PasswordReset WHERE resetId=@resetId) < 1 BEGIN
		UPDATE users SET password=@newpass WHERE email=(SELECT email FROM PasswordReset WHERE resetid=@resetId)
		DELETE FROM PasswordReset WHERE resetId=@resetId 
		SELECT 1
	END ELSE BEGIN
		SELECT 0
	END
END
