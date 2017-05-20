-- =============================================
-- Author:		Mark Entingh
-- Create date: 9/19/2012 6:38 pm
-- Description:	authenticate login from iframe
-- =============================================
CREATE PROCEDURE [dbo].[Security_AuthenticateUser] 
	@email nvarchar(75) = '',
	@password nvarchar(100) = ''
AS
BEGIN
	SELECT * FROM Users WHERE email=@email AND [password]=@password
END
