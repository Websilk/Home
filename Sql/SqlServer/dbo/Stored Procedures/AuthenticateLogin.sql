-- =============================================
-- Author:		Mark Entingh
-- Create date: 9/19/2012 6:38 pm
-- Description:	authenticate login from iframe
-- =============================================
CREATE PROCEDURE [dbo].[AuthenticateLogin] 
	@loginId nvarchar(10)
AS
BEGIN
	SET NOCOUNT ON;
	DECLARE @logindate datetime,
	@hash nvarchar(100),
	@email nvarchar(100)
	
	SELECT @logindate=datecreated, @hash=hash, @email=email FROM Login WHERE loginid=@loginId
	DELETE FROM Login WHERE loginid=@loginId 
	
	IF DATEDIFF(SECOND,@logindate, GETDATE()) < 15
	BEGIN
		SELECT * FROM users WHERE email=@email AND password COLLATE Latin1_General_CS_AS = @hash AND status = 1
	END
END
